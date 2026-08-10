import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";

export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "ADMIN") {
    sendResponse(res, {
      statusCode: 403,
      success: false,
      message: "Forbidden",
      data: null,
    });
    return;
  }
  next();
};
