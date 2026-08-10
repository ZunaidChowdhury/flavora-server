import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import {
  createReview as createReviewService,
  listReviews as listReviewsService,
  getReviewById as getReviewByIdService,
} from "./review.service";

const isValidRating = (rating: unknown): boolean =>
  Number.isInteger(rating) && (rating as number) >= 1 && (rating as number) <= 5;

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recipeId, rating, comment } = req.body ?? {};

    if (
      !recipeId ||
      typeof recipeId !== "string" ||
      !isValidRating(rating) ||
      !comment ||
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message:
          "recipeId (string), rating (integer 1-5), and comment (non-empty string) are required",
        data: null,
      });
      return;
    }

    const data = await createReviewService({
      userId: req.user!.id,
      recipeId,
      rating,
      comment: comment.trim(),
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Review created successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipeId = req.query.recipeId
      ? String(req.query.recipeId)
      : undefined;
    const data = await listReviewsService(recipeId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reviews retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getReviewByIdService(String(req.params.id));
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Review retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};
