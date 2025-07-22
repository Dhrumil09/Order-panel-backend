import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function createError(
  message: string,
  statusCode: number = 500
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
    });
  }

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
  };

  res.status(404).json(response);
}
