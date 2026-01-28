import { WebSocket, WebSocketServer } from "ws";
import { Server } from 'http';
import { chatQueue } from "./queues/chat.queue";
import prismaClient from "@repo/db";

type User = {
  ws: WebSocket,
  userId: string,
  rooms: Set<string>,
  username?: string | null
}

const connections = new Map<string, User>();
const roomMembers = new Map<string, Set<string>>();

const checkUser = async (token: string) => {
  if (!token) return null;
  try {
    const session = await prismaClient.session.findFirst({
      where: {
        token: token
      },
      include: {
        user: true
      }
    });

    if (!session) return null;
    if (session.expiresAt < new Date()) return null;

    return {
      userId: session.userId,
      username: session.user.name || session.user.username
    }
  } catch (error) {
    console.log("Error verifying session.", error)
    return null;
  }
}

export const setupWs = (server: Server) => {

  const RATE_LIMIT_MESSAGES = 5;
  const RATE_LIMIT_WINDOW_MS = 1000;
  const HEARTBEAT_INTERVAL = 30000;

  const aliveMap = new WeakMap<WebSocket, boolean>();

  const socket = new WebSocketServer({ server })

  socket.on("connection", async function connection(ws, req) {
    let messageCount = 0;
    const interval = setInterval(() => {
      messageCount = 0;
    }, RATE_LIMIT_WINDOW_MS);

    aliveMap.set(ws, true);

    const url = req.url;
    if (!url) {
      return
    }
    try {
      const queryParams = new URLSearchParams(url.split('?')[1])
      const token = queryParams.get('token') || "";
      const userAuthentication = await checkUser(token);

      const currentUser: User = {
        userId: userAuthentication?.userId || `GUEST_${Math.random().toString(36).substring(2, 9)}`,
        username: userAuthentication?.username,
        ws,
        rooms: new Set(),
      }

      connections.set(currentUser.userId, currentUser);

      ws.on("message", async function message(data) {
        if (messageCount >= RATE_LIMIT_MESSAGES) {
          console.log('Rate limit exceeded for this connection. Closing connection.');
          ws.close();
          return;
        }
        messageCount++;
        console.log("Websocket connection successfully setup.");
        try {
          const parsedData = JSON.parse(data as unknown as string);

          if (parsedData.type === 'join_room') {
            currentUser.rooms.add(parsedData.roomId);
            if (!roomMembers.has(parsedData.roomId)) {
              roomMembers.set(parsedData.roomId, new Set());
            }
            roomMembers.get(parsedData.roomId)?.add(currentUser.userId);

            const roomId = parsedData.roomId

            await prismaClient.room.createMany({
              data: {
                id: roomId,
                slug: roomId,
                adminId: userAuthentication?.userId || null
              },
              skipDuplicates: true
            });
          }

          if (parsedData.type === 'leave_room') {
            roomMembers.get(parsedData.roomId)?.delete(currentUser.userId);
            currentUser.rooms.delete(parsedData.roomId);
          }

          if (parsedData.type === 'chat') {
            const members = roomMembers.get(parsedData.roomId);
            if (!members) return;
            const { roomId, message } = parsedData
            const shapeData = JSON.parse(message);
            const shapeId = shapeData.id;
            const isDeleted = shapeData.isDeleted || false;

            members.forEach((userId) => {
              const user = connections.get(userId);
              if (user) {
                user.ws.send(JSON.stringify({
                  type: parsedData.type,
                  message,
                  roomId,
                  shapeId,
                  isDeleted,
                }))
              }
            })

            const res = await chatQueue.add("saveMessage", {
              userId: userAuthentication?.userId || null,
              roomId,
              message,
              shapeId,
              isDeleted
            },
              {
                attempts: 3,
                backoff: {
                  type: "exponential",
                  delay: 5000
                }
              }
            );
            console.log("Job added to queue.")
          }
        } catch (error) {
          console.log("Error while processing websocket message.", error)
        }
      });

      ws.on("pong", () => {
        aliveMap.set(ws, true);
      });

      ws.on("close", () => {
        clearInterval(interval);
        currentUser.rooms.forEach((roomId) => {
          const roomSet = roomMembers.get(roomId);
          roomSet?.delete(currentUser.userId);
          if (roomSet?.size === 0) roomMembers.delete(roomId);
        })
        connections.delete(currentUser.userId);
        console.log("User disconnected and removed from memory.");
      });

      ws.on("error", (error) => {
        console.log("Error while connecting to websocket server.", error);
        ws.close();
      });
    } catch (error) {
      console.log("Error while connecting to websocket server.", error);
      ws.close();
      return;
    }
  })
  const heartbeatInterval = setInterval(() => {
    socket.clients.forEach((ws) => {
      if (aliveMap.get(ws) === false) {
        console.log("Terminating dead connection.");
        return ws.terminate();
      }
      aliveMap.set(ws, false);
      ws.ping();
    })
  }, HEARTBEAT_INTERVAL);

  socket.on('close', () => {
    clearInterval(heartbeatInterval);
  })
}