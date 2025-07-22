import { Request, Response, NextFunction } from "express";
import { getHealthStatus } from "../services/healthService";
import { ApiResponse } from "../types";

export async function healthCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const healthStatus = await getHealthStatus();

    const response: ApiResponse = {
      success: true,
      data: healthStatus,
      message: "Health check completed",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
