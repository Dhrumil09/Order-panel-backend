import { Request, Response } from "express";
import companyService from "../services/companyService";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response";
import { validate, commonValidations } from "../utils/validation";

export class CompanyController {
  async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      const companies = await companyService.getAllCompanies();
      sendSuccessResponse(
        res,
        { companies },
        "Companies retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching companies:", error);
      sendErrorResponse(res, "Failed to fetch companies", 500, error);
    }
  }

  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const company = await companyService.createCompany(req.body);
      sendSuccessResponse(
        res,
        { company },
        "Company created successfully",
        201
      );
    } catch (error) {
      console.error("Error creating company:", error);

      if (error.code === "23505") {
        // PostgreSQL unique constraint violation
        sendErrorResponse(res, "Company with this name already exists", 400);
        return;
      }

      sendErrorResponse(res, "Failed to create company", 500, error);
    }
  }

  async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await companyService.deleteCompany(id);

      if (!deleted) {
        sendErrorResponse(res, "Company not found", 404);
        return;
      }

      sendSuccessResponse(res, null, "Company deleted successfully");
    } catch (error) {
      console.error("Error deleting company:", error);
      sendErrorResponse(res, "Failed to delete company", 500, error);
    }
  }
}

// Validation middleware for company operations
export const companyValidation = {
  create: validate([commonValidations.requiredString("name")]),
};

export default new CompanyController();
