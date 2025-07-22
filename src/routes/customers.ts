import { Router } from "express";
import customerController, {
  customerValidation,
} from "../controllers/customerController";
import { validateSearchParams } from "../utils/validation";

const router = Router();

// Get all customers with pagination, search, and filters
router.get("/", validateSearchParams, customerController.getAllCustomers);

// Get location data for filters (must come before :id route)
router.get("/locations", customerController.getLocationData);

// Get customer by ID with order history
router.get("/:id", customerController.getCustomerById);

// Create new customer
router.post("/", customerValidation.create, customerController.createCustomer);

// Update customer
router.put(
  "/:id",
  customerValidation.update,
  customerController.updateCustomer
);

// Delete customer (soft delete)
router.delete("/:id", customerController.deleteCustomer);

// Restore customer (undo soft delete)
router.patch("/:id/restore", customerController.restoreCustomer);

export default router;
