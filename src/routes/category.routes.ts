import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../services/category/category.controller";

const router = Router();

router.post("/", verifyToken, verifyAdmin, createCategory);
router.get("/", listCategories);
router.get("/:id", getCategory);
router.put("/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

export default router;
