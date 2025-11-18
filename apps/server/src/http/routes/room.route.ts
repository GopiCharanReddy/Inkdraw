import express, { Router } from "express";
import { createRoom } from "../controllers/room.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.route('/:roomId').get(authMiddleware,createRoom);

export default router