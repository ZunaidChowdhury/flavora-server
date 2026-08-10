import type { Response } from "express";

export interface SendResponseParams {
  statusCode: number;
  success: boolean;
  message: string;
  data?: unknown | null;
}

export const sendResponse = (
  res: Response,
  { statusCode, success, message, data = null }: SendResponseParams
): void => {
  res.status(statusCode).json({ success, message, data });
};

export default sendResponse;
