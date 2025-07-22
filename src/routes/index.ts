import { Router } from "express";
import healthRoutes from "./health";
import authRoutes from "./auth";
import customerRoutes from "./customers";
import companyRoutes from "./companies";
import categoryRoutes from "./categories";
import productRoutes from "./products";
import orderRoutes from "./orders";
import dashboardRoutes from "./dashboard";
import analyticsRoutes from "./analytics";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// Health check route (public)
router.use("/health", healthRoutes);

// API versioning
router.use("/api/v1", healthRoutes);

// Authentication routes (public)
router.use("/api/v1/auth", authRoutes);

// Protected routes (authentication required)
router.use("/api/v1/customers", authenticateToken, customerRoutes);
router.use("/api/v1/companies", authenticateToken, companyRoutes);
router.use("/api/v1/categories", authenticateToken, categoryRoutes);
router.use("/api/v1/products", authenticateToken, productRoutes);
router.use("/api/v1/orders", authenticateToken, orderRoutes);
router.use("/api/v1/dashboard", authenticateToken, dashboardRoutes);
router.use("/api/v1/analytics", authenticateToken, analyticsRoutes);

export default router;
