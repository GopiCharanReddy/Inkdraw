import { Router } from 'express'
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { uploadImage } from '../controllers/upload.controller';
import { Request } from 'express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

cloudinary.config({
  secure: true
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    try {
      const folderPath = 'inkdraw-images';
      const fileExtension = path.extname(file.originalname).substring(1);
      const basename = path.basename(file.originalname, `.${fileExtension}`);
      const safeName = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
      const publicId = `${safeName}-${Date.now()}`

      return {
        folder: folderPath,
        public_id: publicId,
        format: fileExtension,
        allowed_formats: ['jpg', 'jpeg', 'png'],
      }
    } catch (error) {
      console.error("Error generating Cloudinary params: ", error);
      throw error;
    }
  }
})

const fileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Invalid file type, only JPEG, JPG and PNG are allowed."));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 2
  }
})
router.post("/", upload.single('image'), uploadImage);

export default router;