import { Request, Response } from "express";
import categoryService from "../services/categoryService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { validate, commonValidations } from "../utils/validation";

export class CategoryController {
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();
      sendSuccessResponse(
        res,
        { categories },
        "Categories retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      sendErrorResponse(res, "Failed to fetch categories", 500, error);
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);
      sendSuccessResponse(
        res,
        { category },
        "Category created successfully",
        201
      );
    } catch (error) {
      console.error("Error creating category:", error);

      if (error.code === "23505") {
        // PostgreSQL unique constraint violation
        sendErrorResponse(res, "Category with this name already exists", 400);
        return;
      }

      sendErrorResponse(res, "Failed to create category", 500, error);
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await categoryService.deleteCategory(id);

      if (!deleted) {
        sendErrorResponse(res, "Category not found", 404);
        return;
      }

      sendSuccessResponse(res, null, "Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      sendErrorResponse(res, "Failed to delete category", 500, error);
    }
  }
}

// Validation middleware for category operations
export const categoryValidation = {
  create: validate([commonValidations.requiredString("name")]),
};

export default new CategoryController();
