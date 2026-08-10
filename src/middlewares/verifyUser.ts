import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";

export type OwnerResolver = (req: Request) => Promise<string | null>;

export const verifyUser =
  (resolver: OwnerResolver) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ownerId = await resolver(req);

      if (req.user?.role === "ADMIN") {
        next();
        return;
      }

      if (ownerId && req.user?.id === ownerId) {
        next();
        return;
      }

      sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        data: null,
      });
    } catch (err) {
      next(err as Error);
    }
  };
