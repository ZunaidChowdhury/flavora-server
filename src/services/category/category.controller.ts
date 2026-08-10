import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import {
  createCategory as createCategoryService,
  listCategories as listCategoriesService,
  getCategoryById,
  updateCategory as updateCategoryService,
  softDeleteCategory,
} from "./category.service";

const STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const name = req.body?.name;

    if (!name || !name.trim()) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "name is required",
        data: null,
      });
      return;
    }

    const data = await createCategoryService({ name });
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Category created successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === "true";

    if (includeInactive && req.user?.role !== "ADMIN") {
      sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        data: null,
      });
      return;
    }

    const data = await listCategoriesService({ includeInactive });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Categories retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getCategoryById(String(req.params.id));
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Category retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body ?? {};
    const status = body.status;

    if (status !== undefined && !STATUSES.includes(status)) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "status must be ACTIVE, INACTIVE, or ARCHIVED",
        data: null,
      });
      return;
    }

    const data = await updateCategoryService(String(req.params.id), {
      name: body.name,
      status,
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Category updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await softDeleteCategory(String(req.params.id));
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
