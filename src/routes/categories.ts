import { Router } from "express";
import categoryController, {
  categoryValidation,
} from "../controllers/categoryController";

const router = Router();

// Get all categories
router.get("/", categoryController.getAllCategories);

// Create category
router.post("/", categoryValidation.create, categoryController.createCategory);

// Delete category
router.delete("/:id", categoryController.deleteCategory);

export default router;
