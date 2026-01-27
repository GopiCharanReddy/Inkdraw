import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  const fileUrl = `${process.env.HTTP_URL || "http://localhost:8080"}/uploads/${req.file.filename}`;

  res.json({
    imgUrl: fileUrl
  })
}