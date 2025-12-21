import express, {Express} from "express";
import userRoute from './routes/user.route';
import roomRoute from './routes/room.route';
import messageRoute from './routes/message.route';
import cors from 'cors';

const app: Express =  express();
const router = express.Router();
app.use(cors());
app.use(express.json());
app.use('/api/v1', router)
router.use('/users', userRoute)
router.use('/rooms', roomRoute)
router.use('/chat', messageRoute)

export default app