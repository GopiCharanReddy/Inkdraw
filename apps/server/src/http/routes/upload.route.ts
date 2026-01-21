import { Router } from 'express'
import multer from 'multer';
import path from 'path';
import { uploadImage } from '../controllers/upload.controller';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage })

router.post("/", upload.single('image'), uploadImage);

export default router;