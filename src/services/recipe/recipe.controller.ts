import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { verifyJwt, type JwtPayload } from "../../utils/jwt";
import {
  createRecipe as createRecipeService,
  listPublicRecipes as listPublicRecipesService,
  getRecipeById as getRecipeByIdService,
  listMyRecipes as listMyRecipesService,
  updateRecipe as updateRecipeService,
  updateRecipeVisibility as updateRecipeVisibilityService,
  toggleFavorite as toggleFavoriteService,
  listFavoriteRecipes as listFavoriteRecipesService,
  listAllRecipes as listAllRecipesService,
  updateAdminVisibility as updateAdminVisibilityService,
  getAdminStats as getAdminStatsService,
  softDeleteRecipe as softDeleteRecipeService,
} from "./recipe.service";

const ingredientsValid = (ingredients: unknown): boolean =>
  Array.isArray(ingredients) &&
  ingredients.length > 0 &&
  ingredients.every(
    (ingredient) =>
      typeof ingredient === "string" && ingredient.trim().length > 0
  );

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

    if (
      !title ||
      !title.trim() ||
      !description ||
      !description.trim() ||
      !instructions ||
      !instructions.trim() ||
      !ingredientsValid(ingredients) ||
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
    const search = req.query.search ? String(req.query.search) : undefined;
    const categoryId = req.query.categoryId
      ? String(req.query.categoryId)
      : undefined;
    const sortRaw = req.query.sort ? String(req.query.sort) : undefined;

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

    if (sortRaw !== undefined && sortRaw !== "newest" && sortRaw !== "oldest") {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "sort must be 'newest' or 'oldest'",
        data: null,
      });
      return;
    }

    const data = await listPublicRecipesService({
      page,
      limit,
      search,
      categoryId,
      sort: sortRaw === "oldest" || sortRaw === "newest" ? sortRaw : undefined,
    });
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

export const toggleFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await toggleFavoriteService(
      req.user!.id,
      String(req.params.id)
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Favorite toggled successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listMyFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await listFavoriteRecipesService(req.user!.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Favorites retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listAllRecipesAdmin = async (
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

    const data = await listAllRecipesService({ page, limit });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All recipes retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAdminStatsService();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin stats retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminVisibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isUnpublishedByAdmin } = req.body ?? {};

    if (typeof isUnpublishedByAdmin !== "boolean") {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "isUnpublishedByAdmin must be a boolean",
        data: null,
      });
      return;
    }

    const data = await updateAdminVisibilityService(
      String(req.params.id),
      isUnpublishedByAdmin
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: isUnpublishedByAdmin
        ? "Recipe unpublished by admin"
        : "Recipe republished",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateRecipe = async (
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

    const hasUpdate =
      title !== undefined ||
      description !== undefined ||
      ingredients !== undefined ||
      instructions !== undefined ||
      categoryId !== undefined ||
      image !== undefined;

    if (!hasUpdate) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "At least one field to update is required",
        data: null,
      });
      return;
    }

    if (title !== undefined && !title.trim()) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "title cannot be empty",
        data: null,
      });
      return;
    }

    if (description !== undefined && !description.trim()) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "description cannot be empty",
        data: null,
      });
      return;
    }

    if (ingredients !== undefined && !ingredientsValid(ingredients)) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "ingredients must be a non-empty array of strings",
        data: null,
      });
      return;
    }

    if (instructions !== undefined && !instructions.trim()) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "instructions cannot be empty",
        data: null,
      });
      return;
    }

    if (categoryId !== undefined && typeof categoryId !== "string") {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "categoryId must be a string",
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

    const data = await updateRecipeService(String(req.params.id), {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(ingredients !== undefined
        ? { ingredients: ingredients.map((i: string) => i.trim()) }
        : {}),
      ...(instructions !== undefined
        ? { instructions: instructions.trim() }
        : {}),
      ...(image !== undefined ? { image } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recipe updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateVisibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const visibility = req.body?.visibility;

    if (visibility !== "PUBLIC" && visibility !== "PRIVATE") {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "visibility must be 'PUBLIC' or 'PRIVATE'",
        data: null,
      });
      return;
    }

    const data = await updateRecipeVisibilityService(
      String(req.params.id),
      visibility
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recipe visibility updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await softDeleteRecipeService(String(req.params.id));
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recipe deleted successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};