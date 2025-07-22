import { Router } from "express";
import companyController, {
  companyValidation,
} from "../controllers/companyController";

const router = Router();

// Get all companies
router.get("/", companyController.getAllCompanies);

// Create company
router.post("/", companyValidation.create, companyController.createCompany);

// Delete company (soft delete)
router.delete("/:id", companyController.deleteCompany);

// Restore company (undo soft delete)
router.patch("/:id/restore", companyController.restoreCompany);

export default router;
