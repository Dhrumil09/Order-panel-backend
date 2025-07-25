import db from "../db";
import bcrypt from "bcrypt";
import {
  generateTokenPair,
  generateAccessToken,
  verifyRefreshToken,
} from "../middlewares/auth";
import {
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  User,
} from "../api-types";

export class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { email, password } = credentials;

    // Find user by email (only non-deleted users)
    const user = await db("users")
      .where("email", email)
      .where("is_deleted", false)
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate token pair
    const tokenPair = generateTokenPair({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error("Invalid refresh token");
    }

    // Check if user still exists and is not deleted
    const user = await db("users")
      .where("id", decoded.id)
      .where("is_deleted", false)
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { accessToken };
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await db("users")
      .where("email", email)
      .where("is_deleted", false)
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [user] = await db("users")
      .insert({
        name,
        email,
        password: hashedPassword,
        is_deleted: false,
      })
      .returning("*");

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await db("users")
      .where("id", id)
      .where("is_deleted", false)
      .first();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    };
  }

  async getAllUsers(): Promise<User[]> {
    const users = await db("users")
      .where("is_deleted", false)
      .select("id", "email", "name", "created_at")
      .orderBy("created_at", "desc");

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    }));
  }
}

export default new AuthService();
