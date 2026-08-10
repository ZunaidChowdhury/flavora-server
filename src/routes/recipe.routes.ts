import { Router } from "express";
import type { Request } from "express";
import prisma from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { verifyToken } from "../middlewares/verifyToken";
import { verifyUser } from "../middlewares/verifyUser";
import {
  createRecipe,
  listRecipes,
  getRecipe,
  listMyRecipes,
  updateRecipe,
  updateVisibility,
  deleteRecipe,
} from "../services/recipe/recipe.controller";

const resolveRecipeOwner = async (req: Request): Promise<string | null> => {
  const recipe = await prisma.recipe.findFirst({
    where: { id: String(req.params.id), isDeleted: false },
    select: { authorId: true },
  });

  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  return recipe.authorId;
};

const router = Router();

router.post("/", verifyToken, createRecipe);
router.get("/", listRecipes);
router.get("/mine", verifyToken, listMyRecipes);
router.get("/:id", getRecipe);
router.put("/:id", verifyToken, verifyUser(resolveRecipeOwner), updateRecipe);
router.put(
  "/:id/visibility",
  verifyToken,
  verifyUser(resolveRecipeOwner),
  updateVisibility
);
router.delete(
  "/:id",
  verifyToken,
  verifyUser(resolveRecipeOwner),
  deleteRecipe
);

export default router;