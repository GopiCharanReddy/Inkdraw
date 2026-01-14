import { NextFunction, Request, Response } from "express";
import prismaClient from "@repo/db"

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers['authorization'];
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : header;

  if(!token) {
    return res.status(401).json({
      message: "Unauthorized."
    })
  }
  try {
    const session = await prismaClient.session.findFirst({
      where: {
        token: token
      },
      include: {
        user: true
      }
    });

    if(!session) {
      return res.status(403).json({
        message: "Invalid session."
      })
    }

    if(session.expiresAt < new Date()) {
      return res.status(403).json({
        message: "Session expired."
      })
    }
    req.userId = session.id;
    next();
  } catch (error) {
    console.error("Auth Middleware Error: ", error);
    return res.status(500).json({
      message: "Internal Server Error"
    })
  }
}