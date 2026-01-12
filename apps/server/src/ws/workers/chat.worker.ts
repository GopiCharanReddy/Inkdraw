import prismaClient  from "@repo/db";
import { Worker } from "bullmq";
import { createRedisConnection } from "@repo/redis";
import { UnrecoverableError } from "bullmq";

export const chatWorker = new Worker(
  "chatQueue",
  async (job) => {
    const { userId, roomId, message, shapeId, isDeleted } = job.data;
    try {
      
    await prismaClient.message.upsert({
      where: { shapeId },
      update: {
        content: message,
        isDeleted,
      },
      create: {
        content: message,
        userId: userId || null,
        roomId: Number(roomId),
        shapeId,
        isDeleted,
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