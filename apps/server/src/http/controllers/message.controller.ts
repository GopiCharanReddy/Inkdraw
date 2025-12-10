import prismaClient from "@repo/db";
import { FetchMessages } from "@repo/schema";
import { Request, Response } from "express";

export const loadMessages = async (req: Request, res: Response) => {
  const parsedData = FetchMessages.safeParse(req.params.roomId);
  if(!parsedData.success) {
    return res.status(401).json({
      message: "Enter valid room id."
    })
  }

  try {
    const messages = await prismaClient.message.findMany({
      where: {
        roomId: parsedData.data?.roomId,
      }, orderBy: {
        id: 'desc'
      },
      take: 50
    }, )
    if(!messages) {
      return res.status(400).json({
        message: "Messages do not exist."
      })
    }

    return res.status(201).json({
      messages,
    })
  } catch (error) {
    console.error("An error occurred while loading messages.")
  }
}