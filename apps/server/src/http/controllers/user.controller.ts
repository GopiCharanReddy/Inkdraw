import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

export const signup = async (req: Request, res: Response) => {

  const {user, email, password} = req.body;

  if(!user || !email || !password) {
    throw new Error("Enter valid credentails.");
  }
  const token = jwt.sign({
    id: user._id,
    uesrname: user.uesrname
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