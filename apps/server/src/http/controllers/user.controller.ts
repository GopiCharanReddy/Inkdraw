import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { UserSchema } from "@repo/schema";
import bcrypt from "bcryptjs";
import prismaClient from '@repo/db';

export const generateToken = (payload: object) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    {
      expiresIn: "5h"
    }
  );
}

export const signup = async (req: Request, res: Response) => {

  const parsedData = UserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(400).json({
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
      return res.status(401).json({
        message: "User already exists."
      })
    }
    const user = await prismaClient.user.create({
      data: {
        username: parsedData.data.username,
        email: parsedData.data.email,
        passwordHash: hashedPassword
      }
    })
    if (!user) {
      return res.status(400).json({ error: "Error while Signing up." })
    }
    const token = generateToken({
      id: user.id,
      username: user.username
    })
    res.status(201).json({
      userId: user.id,
      token,
      message: "User signed up successfully."
    });
  } catch (error) {
    console.log("Signup error: ", error)
    return res.status(500).json({
      error: "Unexpected error while signing up."
    })
  }
}

export const signin = async (req: Request, res: Response) => {
  const parsedData = UserSchema.safeParse(req.body);
  try {
    if (!parsedData.success) {
      res.status(400).json({
        message: "Enter valid credentials."
      })
    }
    const existingUser = await prismaClient.user.findFirst({
      where: {
        username: parsedData.data?.username,
      }
    });
  
    if (!existingUser) {
      res.status(400).json({
        message: "User does not exist."
      })
    }
    const token = generateToken({
      id: existingUser?.id,
      username: existingUser?.username
    })
    return res.status(201).json({
      token,
      message: "User signed up successfully."
    })
  } catch (error) {
    console.log("Signin error: ",error);
    return res.json({
      error: "Unexpected error while signing in."
    })
  }
}