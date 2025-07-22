import db from "../db";
import { Category, CreateCategoryRequest } from "../../api-types";

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const categories = await db("categories")
      .select("id", "name")
      .orderBy("name");

    // Get product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await db("products")
          .where("category_id", category.id)
          .count("* as count")
          .first();

        return {
          id: category.id,
          name: category.name,
          productCount: parseInt((productCount?.count as string) || "0"),
        };
      })
    );

    return categoriesWithCount;
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const [category] = await db("categories")
      .insert({ name: data.name })
      .returning("*");

    return {
      id: category.id,
      name: category.name,
    };
  }

  async deleteCategory(id: string): Promise<boolean> {
    const deletedCount = await db("categories").where("id", id).del();
    return deletedCount > 0;
  }
}

export default new CategoryService();
