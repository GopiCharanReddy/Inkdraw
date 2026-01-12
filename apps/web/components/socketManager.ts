import { IncomingWsData } from "@repo/schema";

let ws: WebSocket | null = null;
let currentUrl: string | null = null;
export const initWebsocket = (url: string, roomId: string, onMessage: (data: IncomingWsData) => void): WebSocket | null => {
  if (typeof window === 'undefined') return null;

  if (!url || url.trim() === "") {
    return null;
  }

  if (ws && ws.readyState === WebSocket.OPEN && currentUrl === url) {
    return ws;
  }

  if (ws) {
    ws.close();
    ws = null;
  }
  const socket = new WebSocket(url);
  try {
    ws = socket
    currentUrl = url;
  } catch (error) {
    console.error("Invalid Websocket url: ", url);
    return null;
  }

  socket.onopen = () => {
    console.log("Socket connected.")
    if (socket.readyState === WebSocket.OPEN) {
      socket?.send(JSON.stringify({
        type: 'join_room',
        roomId: roomId
      }))
    }
  }

  socket.onmessage = (event: MessageEvent) => {
    try {
      const parsedData: IncomingWsData = JSON.parse(event.data);
      onMessage(parsedData);
    } catch (e) {
      console.error("Failed to parse WS message.", e)
    }
  }

  socket.onclose = () => {
    console.log("Socket disconencted.")
    if (ws === socket) {
      ws = null;
      currentUrl = null;
    }
  }

  return socket;
}

export const sendWSMessage = (message: IncomingWsData) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}