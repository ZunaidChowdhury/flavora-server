import { Router } from "express";
import { register, login } from "../services/user/user.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
