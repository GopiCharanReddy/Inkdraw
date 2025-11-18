import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from 'jsonwebtoken';
import http, { Server } from 'http';
import express from 'express';

export const setupWs = (server: Server) => {
  const socket = new WebSocketServer({ server })

  socket.on("connection", function connection(ws, req) {
    const url = req.url;
    if (!url) {
      return
    }
    try {
      const queryParams = new URLSearchParams(url.split('?')[1])
      const token = queryParams.get('name') || "";
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { userId: string };

      if (!decoded || !decoded.userId) {
        console.log("WS rejected, invalid token.")
        ws.close();
        return;
      }
      ws.on("message", function message(data) {
        console.log("Websocket connection successfully setup.")
      });
    } catch (error) {
      console.log("Error while connecting to websocket server.", error);
      ws.close();
      return;
    }
    ws.send("Hi there. This is a ws connection");
  })
}