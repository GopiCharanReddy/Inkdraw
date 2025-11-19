import express from "express";
import app from './http/app';
import http from 'http';
import { setupWs } from "./ws/setup";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

setupWs(server);

app.listen(PORT,() => {
  console.log("Server is listening on PORT: ", PORT);
});