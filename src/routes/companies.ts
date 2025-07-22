import { Router } from "express";
import companyController, {
  companyValidation,
} from "../controllers/companyController";

const router = Router();

// Get all companies
router.get("/", companyController.getAllCompanies);

// Create company
router.post("/", companyValidation.create, companyController.createCompany);

// Delete company
router.delete("/:id", companyController.deleteCompany);

export default router;
