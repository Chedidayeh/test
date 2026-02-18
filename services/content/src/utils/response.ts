import { Response } from "express";
import type { ApiResponse, PaginationMeta } from "@shared/types";

/**
 * Send a successful response
 * Aligned with shared ApiResponse type
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date(),
  };

  res.status(statusCode).json(response);
};

/**
 * Send an error response
 * Aligned with shared ApiResponse type
 * Supports both old signature sendError(res, errorString, statusCode, message)
 * and cleaner signature sendError(res, message, statusCode, code)
 */
export const sendError = (
  res: Response,
  messageOrError: string,
  statusCode: number = 500,
  codeOrMessage: string = "ERROR"
): void => {
  const response: ApiResponse<null> = {
    success: false,
    data: undefined,
    error: {
      code: codeOrMessage,
      message: messageOrError,
    },
    timestamp: new Date(),
  };

  res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * Converts offset-based pagination to page-based pagination for shared types compliance
 * @param res Express response object
 * @param items Array of items to return
 * @param total Total number of items available
 * @param limit Items per page (default 20)
 * @param offset Offset for pagination (default 0)
 * @param statusCode HTTP status code
 */
export const sendPaginated = <T>(
  res: Response,
  items: T[],
  total: number,
  limit: number = 20,
  offset: number = 0,
  statusCode: number = 200
): void => {
  // Convert offset/limit to page-based pagination
  const page = Math.floor(offset / limit) + 1;
  const pageSize = limit;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  const pagination: PaginationMeta = {
    total,
    page,
    pageSize,
    hasMore,
  };

  const response: ApiResponse<T[]> = {
    success: true,
    data: items,
    error: undefined,
    timestamp: new Date(),
  } as any;

  // Add pagination to response
  (response as any).pagination = pagination;

  res.status(statusCode).json(response);
};
