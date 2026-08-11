import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import {
  registerUser,
  loginUser,
  listUsers as listUsersService,
  getUserById,
  updateProfile,
  updateUserRole,
  softDeleteUser,
} from "./user.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "name, email, and password are required",
        data: null,
      });
      return;
    }

    const data = await registerUser({ name, email, password, image });
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "email and password are required",
        data: null,
      });
      return;
    }

    const data = await loginUser({ email, password });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const data = await listUsersService({ page, limit });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getUserById(String(req.params.id));
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User retrieved successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await updateProfile(String(req.params.id), req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.body?.role;

    if (role !== "USER" && role !== "ADMIN") {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "role must be 'USER' or 'ADMIN'",
        data: null,
      });
      return;
    }

    const data = await updateUserRole(
      String(req.params.id),
      role,
      req.user!.id
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User role updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await softDeleteUser(String(req.params.id));
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
