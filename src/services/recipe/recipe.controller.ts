import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { verifyJwt, type JwtPayload } from "../../utils/jwt";
import {
  createRecipe as createRecipeService,
  listPublicRecipes as listPublicRecipesService,
  getRecipeById as getRecipeByIdService,
  listMyRecipes as listMyRecipesService,
} from "./recipe.service";

export const createRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      categoryId,
      image,
    } = req.body ?? {};

    const ingredientsValid =
      Array.isArray(ingredients) &&
      ingredients.length > 0 &&
      ingredients.every(
        (ingredient) =>
          typeof ingredient === "string" && ingredient.trim().length > 0
      );

    if (
      !title ||
      !title.trim() ||
      !description ||
      !description.trim() ||
      !instructions ||
      !instructions.trim() ||
      !ingredientsValid ||
      !categoryId
    ) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message:
          "title, description, ingredients (non-empty array of strings), instructions, and categoryId are required",
        data: null,
      });
      return;
    }

    if (image !== undefined && image !== null && typeof image !== "string") {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "image must be a string",
        data: null,
      });
      return;
    }

    const data = await createRecipeService({
      title: title.trim(),
      description: description.trim(),
      ingredients: ingredients.map((i: string) => i.trim()),
      instructions: instructions.trim(),
      image,
      categoryId,
      authorId: req.user!.id,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Recipe created successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    if (
      (page !== undefined && (Number.isNaN(page) || page < 1)) ||
      (limit !== undefined && (Number.isNaN(limit) || limit < 1))
    ) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "page and limit must be positive integers",
        data: null,
      });
      return;
    }

    const data = await listPublicRecipesService({ page, limit });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recipes retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipe = await getRecipeByIdService(String(req.params.id));

    let user: JwtPayload | undefined;
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try {
        user = verifyJwt(header.slice("Bearer ".length));
      } catch {
        user = undefined;
      }
    }

    const isPublic =
      recipe.visibility === "PUBLIC" && !recipe.isUnpublishedByAdmin;
    const isOwner = user?.id === recipe.authorId;
    const isAdmin = user?.role === "ADMIN";

    if (!isPublic && !isOwner && !isAdmin) {
      sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        data: null,
      });
      return;
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recipe retrieved successfully",
      data: recipe,
    });
  } catch (err) {
    next(err);
  }
};

export const listMyRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await listMyRecipesService(req.user!.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "My recipes retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};