import express, { Router } from 'express';
import { signup,signin } from '../controllers/user.controller';

const router:Router = express.Router();

router.route("/signup").post(signup);

router.route("/signin").post(signin);

export default router;