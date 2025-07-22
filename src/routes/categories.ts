import { Router } from "express";
import categoryController, {
  categoryValidation,
} from "../controllers/categoryController";

const router = Router();

// Get all categories
router.get("/", categoryController.getAllCategories);

// Create category
router.post("/", categoryValidation.create, categoryController.createCategory);

// Delete category (soft delete)
router.delete("/:id", categoryController.deleteCategory);

// Restore category (undo soft delete)
router.patch("/:id/restore", categoryController.restoreCategory);

export default router;
