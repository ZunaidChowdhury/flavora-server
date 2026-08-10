import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  createRecipe,
  listRecipes,
} from "../services/recipe/recipe.controller";

const router = Router();

router.post("/", verifyToken, createRecipe);
router.get("/", listRecipes);

export default router;