import { Request, Response } from 'express';
import { config } from '../../config';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  const fileUrl = `${config.HTTP_URL || "http://localhost:8080"}/uploads/${req.file.filename}`;

  return res.json({
    imgUrl: fileUrl
  })
}