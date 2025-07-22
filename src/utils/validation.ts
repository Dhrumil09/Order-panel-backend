import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorDetails = errors.array().map((error) => ({
      field: error.type === "field" ? error.path : error.type,
      message: error.msg,
    }));

    return res.status(400).json({
      success: false,
      error: {
        type: "VALIDATION_ERROR",
        message: "Validation failed",
        details: errorDetails,
      },
    });
  };
}

// Common validation rules
export const commonValidations = {
  email: body("ownerEmail").isEmail().withMessage("Invalid email format"),
  phone: body("ownerPhone")
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage("Invalid phone number format"),
  requiredString: (field: string) =>
    body(field).trim().notEmpty().withMessage(`${field} is required`),
  optionalString: (field: string) => body(field).optional().trim(),
  uuid: (field: string) =>
    body(field).isUUID().withMessage(`Invalid ${field} format`),
  enum: (field: string, values: string[]) =>
    body(field).isIn(values).withMessage(`Invalid ${field} value`),
  positiveNumber: (field: string) =>
    body(field)
      .isFloat({ min: 0 })
      .withMessage(`${field} must be a positive number`),
  positiveInteger: (field: string) =>
    body(field)
      .isInt({ min: 1 })
      .withMessage(`${field} must be a positive integer`),
};

// Search and filter validation
export function validateSearchParams(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { page, limit, sortOrder } = req.query;

  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    res.status(400).json({
      success: false,
      error: {
        type: "VALIDATION_ERROR",
        message: "Page must be a positive integer",
      },
    });
    return;
  }

  if (
    limit &&
    (!Number.isInteger(Number(limit)) ||
      Number(limit) < 1 ||
      Number(limit) > 100)
  ) {
    res.status(400).json({
      success: false,
      error: {
        type: "VALIDATION_ERROR",
        message: "Limit must be between 1 and 100",
      },
    });
    return;
  }

  if (sortOrder && !["asc", "desc"].includes(sortOrder as string)) {
    res.status(400).json({
      success: false,
      error: {
        type: "VALIDATION_ERROR",
        message: 'Sort order must be either "asc" or "desc"',
      },
    });
    return;
  }

  next();
}
