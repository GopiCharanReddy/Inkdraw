import express, { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getUserDetails } from '../controllers/user.controller';

const router:Router = express.Router();

router.get('/me', authMiddleware, getUserDetails);

export default router;