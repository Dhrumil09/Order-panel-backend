import db from "../db";
import bcrypt from "bcrypt";
import { generateToken } from "../middlewares/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await db("users").where("email", data.email).first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async createUser(data: CreateUserRequest): Promise<{
    id: string;
    email: string;
    name: string;
  }> {
    // Check if user already exists
    const existingUser = await db("users").where("email", data.email).first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const [user] = await db("users")
      .insert({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      })
      .returning(["id", "email", "name"]);

    return user;
  }

  async getUserById(id: string): Promise<{
    id: string;
    email: string;
    name: string;
  } | null> {
    const user = await db("users")
      .where("id", id)
      .select("id", "email", "name")
      .first();

    return user || null;
  }

  async getAllUsers(): Promise<
    Array<{
      id: string;
      email: string;
      name: string;
      createdAt: string;
    }>
  > {
    const users = await db("users")
      .select("id", "email", "name", "created_at as createdAt")
      .orderBy("created_at", "desc");

    return users;
  }
}

export default new AuthService();
