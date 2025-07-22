import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { createError } from "./errorHandler";

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join(", ");
    const error = createError(`Validation failed: ${errorMessages}`, 400);
    return next(error);
  }

  next();
}

export function sanitizeInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Basic input sanitization
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
}
