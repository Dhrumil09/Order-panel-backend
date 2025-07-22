import { Router } from "express";
import dashboardController from "../controllers/dashboardController";

const router = Router();

// Get dashboard statistics
router.get("/stats", dashboardController.getDashboardStats);

// Get latest orders
router.get("/latest-orders", dashboardController.getLatestOrders);

export default router;
