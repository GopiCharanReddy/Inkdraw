import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { UserSchema } from "@repo/schema";
import bcrypt from "bcryptjs";
import prismaClient from '@repo/db';

export const signup = async (req: Request, res: Response) => {

  const parsedData = UserSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(401).json({
      message: "Enter valid credentials."
    })
  }
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(parsedData.data.password, salt);

  try {
    const existingUser = await prismaClient.user.findFirst({
      where: {
        username: parsedData.data.username
      }
    });
    if (existingUser) {
      res.status(400).json({
        message: "User already exists."
      })
    }
    const user = await prismaClient.user.create({
      data: {
        username: parsedData.data.username,
        email: parsedData.data.email,
        password: hashedPassword
      }
    })
    if (!user) {
      return res.status(403).json({ message: "Error while Signing up." })
    }
    const token = jwt.sign({
      id: user.id,
      username: user.username
    }, process.env.JWT_SECRET!, { expiresIn: '1h' })
    res.status(201).json({
      token,
      message: "User signed up successfully."
    });
  } catch (error) {
    res.status(402).json({
      message: "Unexpected error while signing up."
    })
  }
}

export const signin = async (req: Request, res: Response) => {
  const parsedData = UserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(401).json({
      message: "Enter valid credentials."
    })
  }
  const existingUser = await prismaClient.user.findFirst({
    where: {
      username: parsedData.data?.username,
    }
  });

  if (!existingUser) {
    res.status(402).json({
      message: "User does not exist."
    })
  }
  const token = jwt.sign({
    id: existingUser?.id,
    username: existingUser?.username
  }, process.env.JWT_SECRET!, { expiresIn: '1h' })

  res.status(201).json({
    token,
    message: "User signed up successfully."
  })
  return;
}