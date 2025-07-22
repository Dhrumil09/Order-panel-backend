import { Request, Response } from "express";
import authService, {
  LoginRequest,
  CreateUserRequest,
} from "../services/authService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { validate, commonValidations } from "../utils/validation";
import { body } from "express-validator";

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const result = await authService.login(loginData);

      sendSuccessResponse(res, result, "Login successful");
    } catch (error) {
      console.error("Login error:", error);
      sendErrorResponse(res, "Login failed", 401, error);
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const user = await authService.createUser(userData);

      sendSuccessResponse(res, { user }, "User created successfully", 201);
    } catch (error: any) {
      console.error("Error creating user:", error);

      if (error.message?.includes("already exists")) {
        sendErrorResponse(res, error.message, 400);
        return;
      }

      sendErrorResponse(res, "Failed to create user", 500, error);
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const user = await authService.getUserById(req.user.id);

      if (!user) {
        sendErrorResponse(res, "User not found", 404);
        return;
      }

      sendSuccessResponse(res, { user }, "Current user retrieved successfully");
    } catch (error) {
      console.error("Error fetching current user:", error);
      sendErrorResponse(res, "Failed to fetch current user", 500, error);
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await authService.getAllUsers();
      sendSuccessResponse(res, { users }, "Users retrieved successfully");
    } catch (error) {
      console.error("Error fetching users:", error);
      sendErrorResponse(res, "Failed to fetch users", 500, error);
    }
  }
}

// Validation middleware for auth operations
export const authValidation = {
  login: validate([
    commonValidations.requiredString("email"),
    body("email").isEmail().withMessage("Invalid email format"),
    commonValidations.requiredString("password"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ]),

  createUser: validate([
    commonValidations.requiredString("name"),
    commonValidations.requiredString("email"),
    body("email").isEmail().withMessage("Invalid email format"),
    commonValidations.requiredString("password"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ]),
};

export default new AuthController();
