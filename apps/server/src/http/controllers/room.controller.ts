import prismaClient  from "@repo/db";
import { CreateRoomSchema, FetchRoomInfo } from "@repo/schema";
import { Request, Response } from "express";

export const createRoom = async (req: Request, res:Response) => {
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

export const infoRoom = async (req: Request, res: Response) => {
  const parsedData = FetchRoomInfo.safeParse(req.params.slug);
  if(!parsedData.success) {
    return res.status(400).json({
      message: "Enter a valid slug."
    })
  }
  try {
    
    const room = await prismaClient.room.findFirst({
      where: {
        slug: parsedData.data.slug
      }
    });

    if(!room || room === null) {
      return res.status(402).json({
        message: "Room does not exist."
      })
    }

    res.status(201).json({
      room
    })
  } catch (error) {
    console.error("Info Room Error: ", error);
    res.status(500).json({
      error: "Unexpected error while fetching Room Info."
    })
  }
}