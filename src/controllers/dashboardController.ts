import { Request, Response } from "express";
import dashboardService from "../services/dashboardService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";

export class DashboardController {
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.getDashboardStats();
      sendSuccessResponse(res, stats, "Dashboard stats retrieved successfully");
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      sendErrorResponse(res, "Failed to fetch dashboard stats", 500, error);
    }
  }

  async getLatestOrders(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const orders = await dashboardService.getLatestOrders(limit);
      sendSuccessResponse(
        res,
        { orders },
        "Latest orders retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching latest orders:", error);
      sendErrorResponse(res, "Failed to fetch latest orders", 500, error);
    }
  }
}

export default new DashboardController();
