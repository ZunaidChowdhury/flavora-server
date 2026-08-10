import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import {
  createCategory as createCategoryService,
  listCategories as listCategoriesService,
} from "./category.service";

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
