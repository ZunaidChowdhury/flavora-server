import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import {
  createCategory,
  listCategories,
} from "../services/category/category.controller";

const router = Router();

router.post("/", verifyToken, verifyAdmin, createCategory);
router.get("/", listCategories);

export default router;
