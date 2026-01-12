import { Router } from "express";
import express from 'express';
import { loadMessages } from "../controllers/message.controller";

const router: Router = express.Router();

router.route('/:roomId').get(loadMessages)

export default router