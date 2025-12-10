import { Router } from "express";
import express from 'express';
import { authMiddleware } from "../middlewares/auth.middleware";
import { loadMessages } from "../controllers/message.controller";

const router: Router = express.Router();

router.route('/:roomId').get(authMiddleware, loadMessages)

export default router