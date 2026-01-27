import { Router } from 'express'
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { uploadImage } from '../controllers/upload.controller';
import { Request } from 'express';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const safeName = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    if (!allowedExtensions.includes(ext.toLowerCase())) {
      return callback(new Error('Invalid file extension'), '');
    }

    callback(null, `${safeName}-${Date.now()}${ext}`);
  }
});

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