import express, { Express } from "express";
import userRoute from './routes/user.route';
import roomRoute from './routes/room.route';
import messageRoute from './routes/message.route';
import uploadRoute from './routes/upload.route';
import cors from 'cors';
import path from "path";
import { rateLimit } from 'express-rate-limit'
import { config } from "../config";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 60
})

const app: Express = express();
const router = express.Router();
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));
app.use(apiLimiter);
app.use(express.json());
app.use('/api/v1', router)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
router.use('/users', userRoute)
router.use('/rooms', roomRoute)
router.use('/chat', messageRoute)
router.use('/upload', uploadRoute)

export default app