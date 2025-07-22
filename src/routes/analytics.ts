import { Router } from "express";
import analyticsController from "../controllers/analyticsController";

const router = Router();

// Get sales analytics
router.get("/sales", analyticsController.getSalesAnalytics);

// Get customer analytics
router.get("/customers", analyticsController.getCustomerAnalytics);

// Get product analytics
router.get("/products", analyticsController.getProductAnalytics);

export default router;
