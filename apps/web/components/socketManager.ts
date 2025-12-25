import { IncomingWsData } from "@repo/schema";

let ws: WebSocket | null = null;

export const initWebsocket = (url: string, roomId: string, onMessage: (data: IncomingWsData) => void): WebSocket | null => {
  if(typeof window === 'undefined') return null;
  if(ws) ws.close();

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("Socket connected.")
    ws?.send(JSON.stringify({
      type: 'join_room',
      roomId: roomId
    }))
  }

  ws.onmessage = (event: MessageEvent) => {
    try {
      const parsedData: IncomingWsData = JSON.parse(event.data);
        onMessage(parsedData);
    } catch (e) {
      console.error("Failed to parse WS message.", e)
    }
  }

  ws.onclose = () => { 
    ws = null
  }

  return ws;
}

export const sendWSMessage = (message: IncomingWsData) => {
  if(ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.error("Cannot send Message: WebSocket is not open.")
  }
}