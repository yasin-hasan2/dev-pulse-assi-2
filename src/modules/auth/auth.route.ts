import { Router } from "express";
import { authController } from "./auth.controller";
import { userValidator } from "../../middlewares/user.validator";

const router = Router();

router.post("/login", authController.loginUser);

export const authRouter = router;
