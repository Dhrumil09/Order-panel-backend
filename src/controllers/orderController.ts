import { Request, Response } from "express";
import orderService from "../services/orderService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { validate, commonValidations } from "../utils/validation";
import { OrderQueryParams } from "../../api-types";
import { body } from "express-validator";

export class OrderController {
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: OrderQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        status: req.query.status as
          | "pending"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled",
        dateFilter: req.query.dateFilter as
          | "today"
          | "yesterday"
          | "last7days"
          | "last30days"
          | "custom",
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: req.query.sortBy as "customerName" | "date" | "status",
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await orderService.getAllOrders(queryParams);

      sendSuccessResponse(res, result, "Orders retrieved successfully");
    } catch (error) {
      console.error("Error fetching orders:", error);
      sendErrorResponse(res, "Failed to fetch orders", 500, error);
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);

      if (!order) {
        sendErrorResponse(res, "Order not found", 404);
        return;
      }

      sendSuccessResponse(
        res,
        { order },
        "Order details retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching order:", error);
      sendErrorResponse(res, "Failed to fetch order", 500, error);
    }
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const order = await orderService.createOrder(req.body, req.user.id);
      sendSuccessResponse(res, { order }, "Order created successfully", 201);
    } catch (error) {
      console.error("Error creating order:", error);

      if (error.message?.includes("Product or variant not found")) {
        sendErrorResponse(res, error.message, 400);
        return;
      }

      if (error.code === "23503") {
        // Foreign key constraint violation
        sendErrorResponse(res, "Invalid customer ID", 400);
        return;
      }

      sendErrorResponse(res, "Failed to create order", 500, error);
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const { id } = req.params;
      const { status, trackingNumber, notes } = req.body;

      const order = await orderService.updateOrderStatus(
        id,
        status,
        req.user.id,
        trackingNumber,
        notes
      );

      if (!order) {
        sendErrorResponse(res, "Order not found", 404);
        return;
      }

      sendSuccessResponse(res, { order }, "Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      sendErrorResponse(res, "Failed to update order status", 500, error);
    }
  }

  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await orderService.deleteOrder(id);

      if (!deleted) {
        sendErrorResponse(res, "Order not found", 404);
        return;
      }

      sendSuccessResponse(res, null, "Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      sendErrorResponse(res, "Failed to delete order", 500, error);
    }
  }
}

// Validation middleware for order operations
export const orderValidation = {
  create: validate([
    commonValidations.uuid("customerId"),
    commonValidations.requiredString("customerName"),
    commonValidations.requiredString("customerAddress"),
    commonValidations.requiredString("customerEmail"),
    commonValidations.requiredString("customerPhone"),
    commonValidations.enum("status", [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
    body("orderItems")
      .isArray({ min: 1 })
      .withMessage("At least one order item is required"),
    body("orderItems.*.productId").isUUID().withMessage("Invalid product ID"),
    body("orderItems.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("orderItems.*.boxes")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Boxes must be a non-negative integer"),
    body("orderItems.*.pieces")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Pieces must be a non-negative integer"),
    body("orderItems.*.pack")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Pack must be a non-negative integer"),
    commonValidations.optionalString("shippingMethod"),
    commonValidations.optionalString("notes"),
  ]),

  updateStatus: validate([
    commonValidations.enum("status", [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
    commonValidations.optionalString("trackingNumber"),
    commonValidations.optionalString("notes"),
  ]),
};

export default new OrderController();
