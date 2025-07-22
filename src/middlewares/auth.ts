import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { sendErrorResponse } from "../utils/response";

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

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    sendErrorResponse(res, "Access token required", 401);
    return;
  }

  const secret = process.env.JWT_SECRET || "your-secret-key";

  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      sendErrorResponse(res, "Invalid or expired token", 403);
      return;
    }

    req.user = user;
    next();
  });
}

export function generateTokenPair(
  payload: Omit<JWTPayload, "iat" | "exp">
): TokenPair {
  const accessSecret = process.env.JWT_SECRET || "your-secret-key";
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

  const accessOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ||
      "15m") as jwt.SignOptions["expiresIn"], // Shorter expiry for access token
  };

  const refreshOptions: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
      "7d") as jwt.SignOptions["expiresIn"], // Longer expiry for refresh token
  };

  const accessToken = jwt.sign(payload, accessSecret, accessOptions);
  const refreshToken = jwt.sign(payload, refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
}

export function generateAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ||
      "15m") as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}

export function verifyRefreshToken(refreshToken: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
    return jwt.verify(refreshToken, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}
