import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode =
    (err as Error & { statusCode?: number }).statusCode ??
    (err as Error & { status?: number }).status ??
    500;

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  sendResponse(res, {
    statusCode,
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
  });
};

export default errorHandler;
