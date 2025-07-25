import { Request, Response } from "express";
import analyticsService from "../services/analyticsService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { AnalyticsQueryParams } from "../api-types";

export class AnalyticsController {
  async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const queryParams: AnalyticsQueryParams = {
        period: req.query.period as "day" | "week" | "month" | "year",
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const analytics = await analyticsService.getSalesAnalytics(queryParams);
      sendSuccessResponse(
        res,
        analytics,
        "Sales analytics retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      sendErrorResponse(res, "Failed to fetch sales analytics", 500, error);
    }
  }

  async getCustomerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await analyticsService.getCustomerAnalytics();
      sendSuccessResponse(
        res,
        analytics,
        "Customer analytics retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      sendErrorResponse(res, "Failed to fetch customer analytics", 500, error);
    }
  }

  async getProductAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await analyticsService.getProductAnalytics();
      sendSuccessResponse(
        res,
        analytics,
        "Product analytics retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching product analytics:", error);
      sendErrorResponse(res, "Failed to fetch product analytics", 500, error);
    }
  }
}

export default new AnalyticsController();
