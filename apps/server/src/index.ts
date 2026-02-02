import app from './http/app';
import http from 'http';
import { setupWs } from "./ws/setup";
import './ws/workers/chat.worker';
import { config } from "./config";

const PORT = config.PORT || 8080;
const server = http.createServer(app);

setupWs(server);

server.listen(PORT, () => {
  console.log("Server is listening on PORT: ", PORT);
});