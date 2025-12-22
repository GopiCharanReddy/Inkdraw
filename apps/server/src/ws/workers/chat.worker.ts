import prismaClient  from "@repo/db";
import { Worker } from "bullmq";
import { createRedisConnection } from "@repo/redis";
import { UnrecoverableError } from "bullmq";

export const chatWorker = new Worker(
  "chatQueue",
  async (job) => {
    const { userId, roomId, message } = job.data;
    console.log(`Processing Job ${job}: User: ${userId}, RoomID: ${roomId}`)
    try {
      
    await prismaClient.message.create({
      data: {
        content: message,
        userId,
        roomId: Number(roomId)
      }
    })
    } catch (error) {
      console.log("Error while queuing message.", error)
      throw new UnrecoverableError("Error while queuing message.")  
    }
    return {
      status: "saved."
    }
  }, {
  connection: createRedisConnection()
})

chatWorker.on("completed", (job) => {
  console.log(`Message saved for job ${job.id}`)
})

chatWorker.on("failed", (job, error) => {
  console.log(`Job ${job?.id} failed: `, error)
})