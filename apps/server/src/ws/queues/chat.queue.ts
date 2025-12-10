import { Queue } from "bullmq";
import { createRedisConnection } from "@repo/redis";

export const chatQueue = new Queue("chatQueue", {
  connection: createRedisConnection(),
});