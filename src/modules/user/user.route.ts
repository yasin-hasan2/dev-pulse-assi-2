import { Router } from "express";
import userController from "./user.controller";
import { userValidator } from "../../middlewares/user.validator";
import auth from "../../middlewares/auth.middleware";

const router = Router();

router.post("/signup", userValidator.validateUser, userController.createUser);
router.get("/", auth(), userController.getAllUsers);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userValidator.validateUser, userController.updateUser);
router.delete("/:id", userController.deleteUser);

export const userRouter = router;
