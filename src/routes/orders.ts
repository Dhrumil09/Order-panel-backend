import { Router } from "express";
import orderController, {
  orderValidation,
} from "../controllers/orderController";
import { validateSearchParams } from "../utils/validation";

const router = Router();

// Get all orders with pagination, search, and filters
router.get("/", validateSearchParams, orderController.getAllOrders);

// Get order by ID with customer details
router.get("/:id", orderController.getOrderById);

// Create new order
router.post("/", orderValidation.create, orderController.createOrder);

// Update order status
router.patch(
  "/:id/status",
  orderValidation.updateStatus,
  orderController.updateOrderStatus
);

// Delete order
router.delete("/:id", orderController.deleteOrder);

export default router;
