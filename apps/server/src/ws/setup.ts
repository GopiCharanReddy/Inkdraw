import { WebSocket, WebSocketServer } from "ws";
import { Server } from 'http';
import { chatQueue } from "./queues/chat.queue";
import prismaClient from "@repo/db";

type User = {
  ws: WebSocket,
  userId: string,
  rooms: string[],
  username?: string | null
}

const users: User[] = [];

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

  const socket = new WebSocketServer({ server })

  socket.on("connection", async function connection(ws, req) {
    let messageCount = 0;
    const interval = setInterval(() => {
      messageCount = 0;
    }, RATE_LIMIT_WINDOW_MS)

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
        rooms: []
      }
      users.push(currentUser)

      ws.on("message", async function message(data) {
        if(messageCount >= RATE_LIMIT_MESSAGES) {
          console.log('Rate limit exceeded for this connection. Closing connection.');
          ws.close();
          return;
        }
        messageCount++;
        console.log("Websocket connection successfully setup.")
        const parsedData = JSON.parse(data as unknown as string)

        if (parsedData.type === 'join_room') {
          const roomId = parsedData.roomId
          if (!currentUser.rooms.includes(parsedData.roomId)) {
            currentUser.rooms.push(parsedData.roomId)
          }
          await prismaClient.room.upsert({
            where: { id: roomId },
            update: {
              ...(userAuthentication && { adminId: userAuthentication.userId })
            },
            create: {
              id: roomId,
              slug: roomId,
              adminId: userAuthentication?.userId || null
            }
          });
        }

        if (parsedData.type === 'leave_room') {
          currentUser.rooms = currentUser.rooms.filter(id => id !== parsedData.roomId)
        }

        if (parsedData.type === 'chat') {
          const { roomId, message } = parsedData
          const shapeData = JSON.parse(message);
          const shapeId = shapeData.id;
          const isDeleted = shapeData.isDeleted || false;

          users.forEach(user => {
            if (user.rooms.includes(roomId)) {
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
      });
      ws.on("close", () => {
        clearInterval(interval);
        const index = users.indexOf(currentUser);
        if (index > -1) {
          users.splice(index, 1);
        }
        console.log("User disconnected and removed from memory.");
      });
    } catch (error) {
      console.log("Error while connecting to websocket server.", error);
      ws.close();
      return;
    }
  })
}