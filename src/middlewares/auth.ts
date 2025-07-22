import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { sendErrorResponse } from "../utils/response";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    sendErrorResponse(res, "Access token required", 401, {
      type: "AUTHENTICATION_ERROR",
      message: "Access token required",
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, secret) as JWTPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    sendErrorResponse(res, "Invalid or expired token", 401, {
      type: "AUTHENTICATION_ERROR",
      message: "Invalid or expired token",
    });
  }
}

export function generateToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "24h") as string,
  };

  return jwt.sign(payload, secret, options);
}
