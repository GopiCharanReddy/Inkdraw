import { Request, Response } from 'express';
import { config } from '../../config';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  // When using Cloudinary, req.file. contains the secure_url
  // For local storage, we would use req.file.filename
  const fileUrl = req.file.path || `${config.HTTP_URL || "http://localhost:8080"}/uploads/${req.file.filename}`;

  return res.json({
    imgUrl: fileUrl
  })
}