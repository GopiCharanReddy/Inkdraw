import { WebSocketServer } from "ws";

const socket = new WebSocketServer({
  port: 8000,
})

socket.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("Websocket connection successfully setup.")
  });
  ws.send("Hi there. This is a ws connection");
})