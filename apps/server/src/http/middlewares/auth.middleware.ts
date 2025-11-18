import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers['authorization']?.split("Bearer ")[1]
  const decoded = jwt.verify(header as string, process.env.JWT_SECRET as string) as {id: string; email:string}
  if(!decoded){
   return res.status(403).json({message: "Invalid token or not loggedn in."});
  }
  req.userId = decoded.id;
  next();
}