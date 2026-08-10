import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  createRecipe,
  listRecipes,
  getRecipe,
  listMyRecipes,
} from "../services/recipe/recipe.controller";

const router = Router();

router.post("/", verifyToken, createRecipe);
router.get("/", listRecipes);
router.get("/mine", verifyToken, listMyRecipes);
router.get("/:id", getRecipe);

export default router;