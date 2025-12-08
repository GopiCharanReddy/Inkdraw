import express, { Router } from "express";
import { createRoom } from "../controllers/room.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = express.Router();

router.route('/room').post(authMiddleware,createRoom);

export default router