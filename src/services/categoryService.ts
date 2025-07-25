import db from "../db";
import { Category, CreateCategoryRequest } from "../api-types";

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    const categories = await db("categories")
      .select("id", "name")
      .where("is_deleted", false) // Filter out soft-deleted records
      .orderBy("name");

    // Get product count for each category (only non-deleted products)
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await db("products")
          .where("category_id", category.id)
          .where("is_deleted", false) // Filter out soft-deleted products
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

  async createCategory(
    data: CreateCategoryRequest,
    userId: string
  ): Promise<Category> {
    const [category] = await db("categories")
      .insert({
        name: data.name,
        created_by: userId,
        updated_by: userId,
        is_deleted: false,
      })
      .returning("*");

    return {
      id: category.id,
      name: category.name,
    };
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    // Soft delete - set is_deleted flag instead of removing record
    const deletedCount = await db("categories")
      .where("id", id)
      .where("is_deleted", false) // Only soft-delete non-deleted records
      .update({
        is_deleted: true,
        updated_by: userId,
      });
    return deletedCount > 0;
  }

  async restoreCategory(id: string, userId: string): Promise<boolean> {
    // Restore soft-deleted category
    const restoredCount = await db("categories")
      .where("id", id)
      .where("is_deleted", true) // Only restore deleted records
      .update({
        is_deleted: false,
        updated_by: userId,
      });
    return restoredCount > 0;
  }
}

export default new CategoryService();
