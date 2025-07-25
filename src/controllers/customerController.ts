import { Request, Response } from "express";
import customerService from "../services/customerService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { validate, commonValidations } from "../utils/validation";
import { CustomerQueryParams } from "../api-types";

export class CustomerController {
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: CustomerQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        status: req.query.status as "active" | "inactive" | "pending",
        area: req.query.area as string,
        city: req.query.city as string,
        state: req.query.state as string,
        sortBy: req.query.sortBy as
          | "shopName"
          | "ownerName"
          | "registrationDate"
          | "totalOrders",
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await customerService.getAllCustomers(queryParams);

      sendSuccessResponse(res, result, "Customers retrieved successfully");
    } catch (error) {
      console.error("Error fetching customers:", error);
      sendErrorResponse(res, "Failed to fetch customers", 500, error);
    }
  }

  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        sendErrorResponse(res, "Customer ID is required", 400);
        return;
      }

      const customer = await customerService.getCustomerById(id);

      if (!customer) {
        sendErrorResponse(res, "Customer not found", 404);
        return;
      }

      sendSuccessResponse(
        res,
        { customer },
        "Customer details retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching customer:", error);
      sendErrorResponse(res, "Failed to fetch customer", 500, error);
    }
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const customer = await customerService.createCustomer(
        req.body,
        req.user.id
      );
      sendSuccessResponse(
        res,
        { customer },
        "Customer created successfully",
        201
      );
    } catch (error: any) {
      console.error("Error creating customer:", error);

      if (error.code === "23505") {
        // PostgreSQL unique constraint violation
        sendErrorResponse(
          res,
          "Customer with this email or phone already exists",
          400
        );
        return;
      }

      sendErrorResponse(res, "Failed to create customer", 500, error);
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const { id } = req.params;
      if (!id) {
        sendErrorResponse(res, "Customer ID is required", 400);
        return;
      }

      const customer = await customerService.updateCustomer(
        id,
        req.body,
        req.user.id
      );

      if (!customer) {
        sendErrorResponse(res, "Customer not found", 404);
        return;
      }

      sendSuccessResponse(res, { customer }, "Customer updated successfully");
    } catch (error: any) {
      console.error("Error updating customer:", error);

      if (error.code === "23505") {
        // PostgreSQL unique constraint violation
        sendErrorResponse(
          res,
          "Customer with this email or phone already exists",
          400
        );
        return;
      }

      sendErrorResponse(res, "Failed to update customer", 500, error);
    }
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const { id } = req.params;
      if (!id) {
        sendErrorResponse(res, "Customer ID is required", 400);
        return;
      }

      const deleted = await customerService.deleteCustomer(id, req.user.id);

      if (!deleted) {
        sendErrorResponse(res, "Customer not found", 404);
        return;
      }

      sendSuccessResponse(res, null, "Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      sendErrorResponse(res, "Failed to delete customer", 500, error);
    }
  }

  async restoreCustomer(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const { id } = req.params;
      if (!id) {
        sendErrorResponse(res, "Customer ID is required", 400);
        return;
      }

      const restored = await customerService.restoreCustomer(id, req.user.id);

      if (!restored) {
        sendErrorResponse(res, "Customer not found or already restored", 404);
        return;
      }

      sendSuccessResponse(res, null, "Customer restored successfully");
    } catch (error) {
      console.error("Error restoring customer:", error);
      sendErrorResponse(res, "Failed to restore customer", 500, error);
    }
  }

  async getLocationData(req: Request, res: Response): Promise<void> {
    try {
      const locationData = await customerService.getLocationData();
      sendSuccessResponse(
        res,
        locationData,
        "Location data retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching location data:", error);
      sendErrorResponse(res, "Failed to fetch location data", 500, error);
    }
  }
}

// Validation middleware for customer operations
export const customerValidation = {
  create: validate([
    commonValidations.requiredString("shopName"),
    commonValidations.requiredString("ownerName"),
    commonValidations.requiredString("ownerPhone"),
    commonValidations.email,
    commonValidations.requiredString("address"),
    commonValidations.requiredString("area"),
    commonValidations.requiredString("city"),
    commonValidations.requiredString("state"),
    commonValidations.requiredString("pincode"),
    commonValidations.enum("status", ["active", "inactive", "pending"]),
    commonValidations.optionalString("notes"),
  ]),

  update: validate([
    commonValidations.requiredString("shopName"),
    commonValidations.requiredString("ownerName"),
    commonValidations.requiredString("ownerPhone"),
    commonValidations.email,
    commonValidations.requiredString("address"),
    commonValidations.requiredString("area"),
    commonValidations.requiredString("city"),
    commonValidations.requiredString("state"),
    commonValidations.requiredString("pincode"),
    commonValidations.enum("status", ["active", "inactive", "pending"]),
    commonValidations.optionalString("notes"),
  ]),
};

export default new CustomerController();
