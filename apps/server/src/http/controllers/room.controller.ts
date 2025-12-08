import prismaClient from "@repo/db";
import { CreateRoomSchema } from "@repo/schema";
import { NextFunction, Request, Response } from "express";

export const createRoom = async (req: Request, res:Response, next: NextFunction) => {
  const parsedData  = CreateRoomSchema.safeParse(req.body);
  if(!parsedData.success) {
    return res.status(400).json({
      message: "Invalid input."
    })
  }
try {
  
    const userId = req.userId;
    
    if(!userId) {
      return res.status(401).json({
        message: "User not authenticated."
      })
    }
  
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId
      }
    })
    res.status(200).json({
      roomId: room.id,
      message: "Room Id"
    })
} catch (error) {
  console.log("Create room error: ", error)
  res.status(500).json({
    error: "Unexpected error while creating the room."
  })
}
}