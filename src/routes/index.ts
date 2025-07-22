import { Router } from "express";
import healthRoutes from "./health";

const router = Router();

// Health check route
router.use("/health", healthRoutes);

// API versioning
router.use("/api/v1", healthRoutes);

export default router;
