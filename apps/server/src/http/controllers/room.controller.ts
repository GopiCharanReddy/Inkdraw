import { NextFunction, Request, Response } from "express";

export const createRoom = async (req: Request, res:Response, next: NextFunction) => {
  const {rooomId} = req.params;
  if(!rooomId) {
    throw new Error("Room Id does not exist.")
  }
}