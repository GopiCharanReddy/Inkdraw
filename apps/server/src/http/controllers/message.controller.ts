import prismaClient from "@repo/db";
import { FetchMessages } from "@repo/schema";
import { Request, Response } from "express";

export const loadMessages = async (req: Request, res: Response) => {
  const parsedData = FetchMessages.safeParse(req.params);
  if(!parsedData.success) {
    return res.status(400).json({
      message: "Enter valid room id."
    })
  }

  try {
    const messages = await prismaClient.message.findMany({
      where: {
        roomId: Number(parsedData.data.roomId),
        isDeleted: false
      }, orderBy: {
        id: 'desc'
      },
      take: 50
    }, )
    return res.status(201).json({
      messages,
    })
  } catch (error) {
    console.error("An error occurred while loading messages.", error)
    res.status(500).json({
      error: "Error while loading messages."
    })
  }
}