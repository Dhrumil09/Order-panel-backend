import { Router } from "express";
import authController, { authValidation } from "../controllers/authController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// Public routes (no authentication required)
router.post("/login", authValidation.login, authController.login);
router.post("/register", authValidation.createUser, authController.createUser);

// Protected routes (authentication required)
router.get("/me", authenticateToken, authController.getCurrentUser);
router.get("/users", authenticateToken, authController.getAllUsers);

export default router;
