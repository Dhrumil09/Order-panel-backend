import { Request, Response } from "express";
import productService from "../services/productService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { validate, commonValidations } from "../utils/validation";
import { ProductQueryParams } from "../../api-types";
import { body } from "express-validator";

export class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: ProductQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        companyId: req.query.companyId as string,
        categoryId: req.query.categoryId as string,
        stockStatus: req.query.stockStatus as "in-stock" | "out-of-stock",
        availability: req.query.availability as "pieces" | "pack" | "both",
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        sizeFilter: req.query.sizeFilter as string,
        sortBy: req.query.sortBy as "name" | "createdAt" | "price",
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await productService.getAllProducts(queryParams);

      sendSuccessResponse(res, result, "Products retrieved successfully");
    } catch (error) {
      console.error("Error fetching products:", error);
      sendErrorResponse(res, "Failed to fetch products", 500, error);
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        sendErrorResponse(res, "Product not found", 404);
        return;
      }

      sendSuccessResponse(
        res,
        { product },
        "Product details retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching product:", error);
      sendErrorResponse(res, "Failed to fetch product", 500, error);
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);
      sendSuccessResponse(
        res,
        { product },
        "Product created successfully",
        201
      );
    } catch (error) {
      console.error("Error creating product:", error);

      if (error.code === "23503") {
        // Foreign key constraint violation
        sendErrorResponse(res, "Invalid company or category ID", 400);
        return;
      }

      sendErrorResponse(res, "Failed to create product", 500, error);
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);

      if (!product) {
        sendErrorResponse(res, "Product not found", 404);
        return;
      }

      sendSuccessResponse(res, { product }, "Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);

      if (error.code === "23503") {
        // Foreign key constraint violation
        sendErrorResponse(res, "Invalid company or category ID", 400);
        return;
      }

      sendErrorResponse(res, "Failed to update product", 500, error);
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await productService.deleteProduct(id);

      if (!deleted) {
        sendErrorResponse(res, "Product not found", 404);
        return;
      }

      sendSuccessResponse(res, null, "Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      sendErrorResponse(res, "Failed to delete product", 500, error);
    }
  }
}

// Validation middleware for product operations
export const productValidation = {
  create: validate([
    commonValidations.requiredString("name"),
    commonValidations.uuid("companyId"),
    commonValidations.uuid("categoryId"),
    commonValidations.requiredString("variants"),
    body("variants")
      .isArray({ min: 1 })
      .withMessage("At least one variant is required"),
    body("variants.*.name").notEmpty().withMessage("Variant name is required"),
    body("variants.*.mrp")
      .isFloat({ min: 0 })
      .withMessage("Variant MRP must be a positive number"),
    body("isOutOfStock")
      .isBoolean()
      .withMessage("isOutOfStock must be a boolean"),
    body("availableInPieces")
      .isBoolean()
      .withMessage("availableInPieces must be a boolean"),
    body("availableInPack")
      .isBoolean()
      .withMessage("availableInPack must be a boolean"),
    body("packSize")
      .optional()
      .isInt({ min: 1 })
      .withMessage("packSize must be a positive integer"),
  ]),

  update: validate([
    commonValidations.requiredString("name"),
    commonValidations.uuid("companyId"),
    commonValidations.uuid("categoryId"),
    commonValidations.requiredString("variants"),
    body("variants")
      .isArray({ min: 1 })
      .withMessage("At least one variant is required"),
    body("variants.*.name").notEmpty().withMessage("Variant name is required"),
    body("variants.*.mrp")
      .isFloat({ min: 0 })
      .withMessage("Variant MRP must be a positive number"),
    body("isOutOfStock")
      .isBoolean()
      .withMessage("isOutOfStock must be a boolean"),
    body("availableInPieces")
      .isBoolean()
      .withMessage("availableInPieces must be a boolean"),
    body("availableInPack")
      .isBoolean()
      .withMessage("availableInPack must be a boolean"),
    body("packSize")
      .optional()
      .isInt({ min: 1 })
      .withMessage("packSize must be a positive integer"),
  ]),
};

export default new ProductController();
