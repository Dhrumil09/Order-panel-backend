import db from "../db";
import { Company, CreateCompanyRequest } from "../../api-types";

export class CompanyService {
  async getAllCompanies(): Promise<Company[]> {
    const companies = await db("companies")
      .select("id", "name")
      .where("is_deleted", false) // Filter out soft-deleted records
      .orderBy("name");

    // Get product count for each company (only non-deleted products)
    const companiesWithCount = await Promise.all(
      companies.map(async (company) => {
        const productCount = await db("products")
          .where("company_id", company.id)
          .where("is_deleted", false) // Filter out soft-deleted products
          .count("* as count")
          .first();

        return {
          id: company.id,
          name: company.name,
          productCount: parseInt((productCount?.count as string) || "0"),
        };
      })
    );

    return companiesWithCount;
  }

  async createCompany(
    data: CreateCompanyRequest,
    userId: string
  ): Promise<Company> {
    const [company] = await db("companies")
      .insert({
        name: data.name,
        created_by: userId,
        updated_by: userId,
        is_deleted: false,
      })
      .returning("*");

    return {
      id: company.id,
      name: company.name,
    };
  }

  async deleteCompany(id: string, userId: string): Promise<boolean> {
    // Soft delete - set is_deleted flag instead of removing record
    const deletedCount = await db("companies")
      .where("id", id)
      .where("is_deleted", false) // Only soft-delete non-deleted records
      .update({
        is_deleted: true,
        updated_by: userId,
      });
    return deletedCount > 0;
  }

  async restoreCompany(id: string, userId: string): Promise<boolean> {
    // Restore soft-deleted company
    const restoredCount = await db("companies")
      .where("id", id)
      .where("is_deleted", true) // Only restore deleted records
      .update({
        is_deleted: false,
        updated_by: userId,
      });
    return restoredCount > 0;
  }
}

export default new CompanyService();
