import { Request, Response } from "express";
import orderService from "../services/orderService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { validate, commonValidations } from "../utils/validation";
import { OrderQueryParams } from "../api-types";
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
      if (!id) {
        sendErrorResponse(res, "Order ID is required", 400);
        return;
      }

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
    } catch (error: any) {
      console.error("Error creating order:", error);

      if (error.message.includes("Product or variant not found")) {
        sendErrorResponse(res, error.message, 400);
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
      if (!id) {
        sendErrorResponse(res, "Order ID is required", 400);
        return;
      }

      const { status, trackingNumber, notes } = req.body;

      const updatedOrder = await orderService.updateOrderStatus(
        id,
        status,
        req.user.id,
        trackingNumber,
        notes
      );

      if (!updatedOrder) {
        sendErrorResponse(res, "Order not found", 404);
        return;
      }

      sendSuccessResponse(
        res,
        { order: updatedOrder },
        "Order status updated successfully"
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      sendErrorResponse(res, "Failed to update order status", 500, error);
    }
  }

  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const { id } = req.params;
      if (!id) {
        sendErrorResponse(res, "Order ID is required", 400);
        return;
      }

      const deleted = await orderService.deleteOrder(id, req.user.id);

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

  async restoreOrder(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendErrorResponse(res, "User not authenticated", 401);
        return;
      }

      const { id } = req.params;
      if (!id) {
        sendErrorResponse(res, "Order ID is required", 400);
        return;
      }

      const restored = await orderService.restoreOrder(id, req.user.id);

      if (!restored) {
        sendErrorResponse(res, "Order not found or already restored", 404);
        return;
      }

      sendSuccessResponse(res, null, "Order restored successfully");
    } catch (error) {
      console.error("Error restoring order:", error);
      sendErrorResponse(res, "Failed to restore order", 500, error);
    }
  }
}

// Validation middleware for order operations
export const orderValidation = {
  create: validate([
    commonValidations.requiredString("customerId"),
    commonValidations.requiredString("customerName"),
    commonValidations.requiredString("customerAddress"),
    body("customerEmail").isEmail().withMessage("Invalid email format"),
    body("customerPhone")
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage("Invalid phone number format"),
    commonValidations.enum("status", [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
    body("orderItems").isArray().withMessage("Order items must be an array"),
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
