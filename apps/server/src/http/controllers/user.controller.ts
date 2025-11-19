import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { UserSchema } from "@repo/schema";
import prismaClient from '@repo/db';

export const signup = async (req: Request, res: Response) => {

  const data = UserSchema.safeParse(req.body);
  if(!data.success) {
    return res.json({
      message: "Enter valid credentials."
    })
  }
  const user = await prismaClient.user.create({
    data: {
      username: data.data.username,
      email: data.data.email,
      password: data.data.password
    }
  })
  if(!user) {
    return res.status(403).json({message: "Error while Signing up."})
  }
  const token = jwt.sign({
    id: user.id,
    uesrname: user.username
  }, process.env.JWT_SECRET!, {expiresIn: '1h'})
  return;
}

export const signin = async (req: Request, res: Response) => {
  const {user, email, password} = req.body;

  if(!user) {
    throw new Error("Enter valid credentails.");
  }

  return;
}