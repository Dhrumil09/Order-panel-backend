import db from "../db";
import { Company, CreateCompanyRequest } from "../../api-types";

export class CompanyService {
  async getAllCompanies(): Promise<Company[]> {
    const companies = await db("companies")
      .select("id", "name")
      .orderBy("name");

    // Get product count for each company
    const companiesWithCount = await Promise.all(
      companies.map(async (company) => {
        const productCount = await db("products")
          .where("company_id", company.id)
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

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    const [company] = await db("companies")
      .insert({ name: data.name })
      .returning("*");

    return {
      id: company.id,
      name: company.name,
    };
  }

  async deleteCompany(id: string): Promise<boolean> {
    const deletedCount = await db("companies").where("id", id).del();
    return deletedCount > 0;
  }
}

export default new CompanyService();
