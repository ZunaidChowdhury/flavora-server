import type { NextFunction, Request, Response } from "express";
import { verifyJwt, type JwtPayload } from "../utils/jwt";
import { sendResponse } from "../utils/sendResponse";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
      data: null,
    });
    return;
  }

  try {
    req.user = verifyJwt(header.slice("Bearer ".length));
    next();
  } catch {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }
};
