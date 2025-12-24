import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server } from 'http';
import { chatQueue } from "./queues/chat.queue";
import prismaClient from "@repo/db";

type User = {
  ws: WebSocket,
  userId: string,
  rooms: string[],
  username?: string
}

const users: User[] = [];

const checkUser = (token: string): Pick<User, 'userId' | 'username'> | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { id: string; username: string };

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || typeof decoded !== "object") {
      console.log("WS rejected, invalid token.")
      return null;
    }

    return {
      userId: decoded.id,
      username: decoded.username
    }
  } catch (error) {
    console.log("User not authenticated.", error)
    return null;
  }
}

export const setupWs = (server: Server) => {
  const socket = new WebSocketServer({ server })

  socket.on("connection", function connection(ws, req) {
    const url = req.url;
    if (!url) {
      return
    }
    try {
      const queryParams = new URLSearchParams(url.split('?')[1])
      const token = queryParams.get('token') || "";
      const userAuthentication = checkUser(token);

      if (!userAuthentication) {
        ws.close();
        return;
      }
      const currentUser: User = {
        userId: userAuthentication.userId,
        ws,
        rooms: []
      }
      users.push(currentUser)

      ws.on("message", async function message(data) {
        console.log("Websocket connection successfully setup.")
        const parsedData = JSON.parse(data as unknown as string)

        if (parsedData.type === 'join_room') {
          const roomId = Number(parsedData.roomId)
          if (!currentUser.rooms.includes(parsedData.roomId)) {
            currentUser.rooms.push(parsedData.roomId)
          }
          await prismaClient.room.upsert({
            where: { id: roomId },
            update: {},
            create: {
              id: roomId,
              slug: roomId.toString(),
              adminId: userAuthentication.userId
            }
          });
        }

        if (parsedData.type === 'leave_room') {
          currentUser.rooms = currentUser.rooms.filter(id => id !== parsedData.roomId)
        }

        if (parsedData.type === 'chat') {
          const { roomId, message } = parsedData

          users.forEach(user => {
            if (user.rooms.includes(roomId)) {
              user.ws.send(JSON.stringify({
                type: 'chat',
                message,
                roomId,
              }))
            }
          })

          const res = await chatQueue.add("saveMessage", {
            userId: userAuthentication.userId,
            roomId,
            message
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