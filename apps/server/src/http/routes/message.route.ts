import { Router } from "express";
import { loadMessages } from "../controllers/message.controller";

const router: Router = Router();

router.route('/:roomId').get(loadMessages)

export default router