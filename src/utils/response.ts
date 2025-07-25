import { Request, Response } from "express";
import { ApiResponse, PaginationInfo } from "../api-types";

export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
  pagination?: PaginationInfo
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    ...(pagination && { pagination }),
  };

  res.status(statusCode).json(response);
}

export function sendErrorResponse(
  res: Response,
  message: string = "Error",
  statusCode: number = 500,
  error?: any
): void {
  const response: ApiResponse<null> = {
    success: false,
    data: null,
    message,
    ...(error && { error }),
  };

  res.status(statusCode).json(response);
}

export function createPaginationInfo(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

export function parsePaginationParams(query: any): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit as string) || 10)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
