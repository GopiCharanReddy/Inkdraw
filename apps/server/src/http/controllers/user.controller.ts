import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { UserSchema } from "@repo/schema";
import bcrypt from "bcryptjs";
import prismaClient from '@repo/db';


export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const user = await prismaClient.user.findUnique({
      where: {
        id: req.userId,
      }
    });
    if(!user) {
      return res.status(404).json({
        message: "User not found."
      })
    }
    return res.json({
      user
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error."
    })
  }
}