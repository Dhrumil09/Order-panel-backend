import { Request, Response } from "express";
import authService from "../services/authService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { validate, commonValidations } from "../utils/validation";
import { body } from "express-validator";

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccessResponse(res, result, "Login successful");
    } catch (error: any) {
      console.error("Login error:", error);
      sendErrorResponse(res, error.message, 401, {
        type: "AUTHENTICATION_ERROR",
        message: error.message,
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        sendErrorResponse(res, "Refresh token is required", 400, {
          type: "VALIDATION_ERROR",
          message: "Refresh token is required",
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      sendSuccessResponse(res, result, "Token refreshed successfully");
    } catch (error: any) {
      console.error("Refresh token error:", error);
      sendErrorResponse(res, error.message, 401, {
        type: "AUTHENTICATION_ERROR",
        message: error.message,
      });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.createUser(req.body);
      sendSuccessResponse(res, { user }, "User created successfully", 201);
    } catch (error: any) {
      console.error("Create user error:", error);

      if (error.message.includes("already exists")) {
        sendErrorResponse(res, error.message, 400, {
          type: "VALIDATION_ERROR",
          message: error.message,
        });
        return;
      }

      sendErrorResponse(res, "Failed to create user", 500, error);
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401, {
          type: "AUTHENTICATION_ERROR",
          message: "User not authenticated",
        });
        return;
      }

      const user = await authService.getUserById(req.user.id);

      if (!user) {
        sendErrorResponse(res, "User not found", 404, {
          type: "NOT_FOUND",
          message: "User not found",
        });
        return;
      }

      sendSuccessResponse(res, { user }, "Current user retrieved successfully");
    } catch (error: any) {
      console.error("Get current user error:", error);
      sendErrorResponse(res, "Failed to get current user", 500, error);
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await authService.getAllUsers();
      sendSuccessResponse(res, { users }, "Users retrieved successfully");
    } catch (error: any) {
      console.error("Get all users error:", error);
      sendErrorResponse(res, "Failed to get users", 500, error);
    }
  }
}

// Validation middleware for authentication operations
export const authValidation = {
  login: validate([
    body("email").isEmail().withMessage("Invalid email format"),
    commonValidations.requiredString("password"),
  ]),

  refreshToken: validate([commonValidations.requiredString("refreshToken")]),

  createUser: validate([
    commonValidations.requiredString("name"),
    body("email").isEmail().withMessage("Invalid email format"),
    commonValidations.requiredString("password"),
  ]),
};

export default new AuthController();
