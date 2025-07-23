import db from "../db";
import {
  Product,
  CreateProductRequest,
  ProductQueryParams,
  ProductWithRelations,
  PaginationInfo,
} from "../../api-types";

export class ProductService {
  async getAllProducts(params: ProductQueryParams): Promise<{
    products: ProductWithRelations[];
    pagination: PaginationInfo;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      companyId,
      categoryId,
      stockStatus,
      availability,
      minPrice,
      maxPrice,
      sizeFilter,
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let query = db("products as p")
      .select("p.*", "c.name as company_name", "cat.name as category_name")
      .leftJoin("companies as c", "p.company_id", "c.id")
      .leftJoin("categories as cat", "p.category_id", "cat.id")
      .where("p.is_deleted", false) // Filter out soft-deleted records
      .where("c.is_deleted", false) // Filter out soft-deleted companies
      .where("cat.is_deleted", false); // Filter out soft-deleted categories

    // Apply search filter
    if (search) {
      query = query.where(function () {
        this.whereILike("p.name", `%${search}%`)
          .orWhereILike("c.name", `%${search}%`)
          .orWhereILike("cat.name", `%${search}%`);
      });
    }

    // Apply company filter
    if (companyId) {
      query = query.where("p.company_id", companyId);
    }

    // Apply category filter
    if (categoryId) {
      query = query.where("p.category_id", categoryId);
    }

    // Apply stock status filter
    if (stockStatus) {
      if (stockStatus === "out-of-stock") {
        query = query.where("p.is_out_of_stock", true);
      } else {
        query = query.where("p.is_out_of_stock", false);
      }
    }

    // Apply availability filter
    if (availability) {
      if (availability === "pieces") {
        query = query.where("p.available_in_pieces", true);
      } else if (availability === "pack") {
        query = query.where("p.available_in_pack", true);
      }
      // 'both' doesn't need additional filtering as it includes both
    }

    // Apply price filters
    if (minPrice !== undefined) {
      query = query.whereExists(function () {
        this.select("*")
          .from("product_variants as pv")
          .whereRaw("pv.product_id = p.id")
          .where("pv.is_deleted", false) // Filter out soft-deleted variants
          .where("pv.mrp", ">=", minPrice);
      });
    }

    if (maxPrice !== undefined) {
      query = query.whereExists(function () {
        this.select("*")
          .from("product_variants as pv")
          .whereRaw("pv.product_id = p.id")
          .where("pv.is_deleted", false) // Filter out soft-deleted variants
          .where("pv.mrp", "<=", maxPrice);
      });
    }

    // Apply size filter
    if (sizeFilter) {
      query = query.whereExists(function () {
        this.select("*")
          .from("product_variants as pv")
          .whereRaw("pv.product_id = p.id")
          .where("pv.is_deleted", false) // Filter out soft-deleted variants
          .whereILike("pv.name", `%${sizeFilter}%`);
      });
    }

    // Get total count for pagination
    const countQuery = db("products as p")
      .leftJoin("companies as c", "p.company_id", "c.id")
      .leftJoin("categories as cat", "p.category_id", "cat.id")
      .where("p.is_deleted", false) // Filter out soft-deleted records
      .where("c.is_deleted", false) // Filter out soft-deleted companies
      .where("cat.is_deleted", false); // Filter out soft-deleted categories

    // Apply the same filters to count query
    if (search) {
      countQuery.where(function () {
        this.whereILike("p.name", `%${search}%`)
          .orWhereILike("c.name", `%${search}%`)
          .orWhereILike("cat.name", `%${search}%`);
      });
    }
    if (companyId) {
      countQuery.where("p.company_id", companyId);
    }
    if (categoryId) {
      countQuery.where("p.category_id", categoryId);
    }
    if (stockStatus) {
      if (stockStatus === "out-of-stock") {
        countQuery.where("p.is_out_of_stock", true);
      } else {
        countQuery.where("p.is_out_of_stock", false);
      }
    }
    if (availability) {
      if (availability === "pieces") {
        countQuery.where("p.available_in_pieces", true);
      } else if (availability === "pack") {
        countQuery.where("p.available_in_pack", true);
      }
    }
    if (minPrice !== undefined) {
      countQuery.whereExists(function () {
        this.select("*")
          .from("product_variants as pv")
          .whereRaw("pv.product_id = p.id")
          .where("pv.is_deleted", false)
          .where("pv.mrp", ">=", minPrice);
      });
    }
    if (maxPrice !== undefined) {
      countQuery.whereExists(function () {
        this.select("*")
          .from("product_variants as pv")
          .whereRaw("pv.product_id = p.id")
          .where("pv.is_deleted", false)
          .where("pv.mrp", "<=", maxPrice);
      });
    }
    if (sizeFilter) {
      countQuery.whereExists(function () {
        this.select("*")
          .from("product_variants as pv")
          .whereRaw("pv.product_id = p.id")
          .where("pv.is_deleted", false)
          .whereILike("pv.name", `%${sizeFilter}%`);
      });
    }

    const totalItems = await countQuery.count("* as count").first();
    const total = parseInt((totalItems?.count as string) || "0");

    // Apply sorting and pagination
    query = query.orderBy(sortBy, sortOrder).limit(limit).offset(offset);

    const products = await query;

    // Get variants for each product (only non-deleted variants)
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await db("product_variants")
          .where("product_id", product.id)
          .where("is_deleted", false) // Filter out soft-deleted variants
          .select("id", "name", "mrp")
          .orderBy("mrp");

        return {
          id: product.id,
          name: product.name,
          companyId: product.company_id,
          categoryId: product.category_id,
          variants: variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            mrp: parseFloat(variant.mrp),
          })),
          isOutOfStock: product.is_out_of_stock,
          availableInPieces: product.available_in_pieces,
          availableInPack: product.available_in_pack,
          packSize: product.pack_size,
          createdAt: product.created_at,
          company: {
            id: product.company_id,
            name: product.company_name,
          },
          category: {
            id: product.category_id,
            name: product.category_name,
          },
        };
      })
    );

    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };

    return { products: productsWithVariants, pagination };
  }

  async getProductById(id: string): Promise<ProductWithRelations | null> {
    const product = await db("products as p")
      .select("p.*", "c.name as company_name", "cat.name as category_name")
      .leftJoin("companies as c", "p.company_id", "c.id")
      .leftJoin("categories as cat", "p.category_id", "cat.id")
      .where("p.id", id)
      .where("p.is_deleted", false) // Filter out soft-deleted records
      .where("c.is_deleted", false) // Filter out soft-deleted companies
      .where("cat.is_deleted", false) // Filter out soft-deleted categories
      .first();

    if (!product) {
      return null;
    }

    // Get product variants (only non-deleted variants)
    const variants = await db("product_variants")
      .where("product_id", id)
      .where("is_deleted", false) // Filter out soft-deleted variants
      .select("id", "name", "mrp")
      .orderBy("mrp");

    return {
      id: product.id,
      name: product.name,
      companyId: product.company_id,
      categoryId: product.category_id,
      variants: variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        mrp: parseFloat(variant.mrp),
      })),
      isOutOfStock: product.is_out_of_stock,
      availableInPieces: product.available_in_pieces,
      availableInPack: product.available_in_pack,
      packSize: product.pack_size,
      createdAt: product.created_at,
      company: {
        id: product.company_id,
        name: product.company_name,
      },
      category: {
        id: product.category_id,
        name: product.category_name,
      },
    };
  }

  async createProduct(
    data: CreateProductRequest,
    userId: string
  ): Promise<Product> {
    return await db.transaction(async (trx) => {
      // Create product
      const [product] = await trx("products")
        .insert({
          name: data.name,
          company_id: data.companyId,
          category_id: data.categoryId,
          is_out_of_stock: data.isOutOfStock,
          available_in_pieces: data.availableInPieces,
          available_in_pack: data.availableInPack,
          pack_size: data.packSize,
          created_by: userId,
          updated_by: userId,
          is_deleted: false,
        })
        .returning("*");

      // Create product variants
      if (data.variants && data.variants.length > 0) {
        const variantData = data.variants.map((variant) => ({
          product_id: product.id,
          name: variant.name,
          mrp: variant.mrp,
          created_by: userId,
          updated_by: userId,
          is_deleted: false,
        }));

        await trx("product_variants").insert(variantData);
      }

      // Get the created variants
      const variants = await trx("product_variants")
        .where("product_id", product.id)
        .where("is_deleted", false)
        .select("id", "name", "mrp")
        .orderBy("mrp");

      return {
        id: product.id,
        name: product.name,
        companyId: product.company_id,
        categoryId: product.category_id,
        variants: variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          mrp: parseFloat(variant.mrp),
        })),
        isOutOfStock: product.is_out_of_stock,
        availableInPieces: product.available_in_pieces,
        availableInPack: product.available_in_pack,
        packSize: product.pack_size,
        createdAt: product.created_at,
      };
    });
  }

  async updateProduct(
    id: string,
    data: CreateProductRequest,
    userId: string
  ): Promise<Product | null> {
    return await db.transaction(async (trx) => {
      // Update product
      const [product] = await trx("products")
        .where("id", id)
        .where("is_deleted", false) // Only update non-deleted records
        .update({
          name: data.name,
          company_id: data.companyId,
          category_id: data.categoryId,
          is_out_of_stock: data.isOutOfStock,
          available_in_pieces: data.availableInPieces,
          available_in_pack: data.availableInPack,
          pack_size: data.packSize,
          updated_by: userId,
        })
        .returning("*");

      if (!product) {
        return null;
      }

      // Soft delete existing variants
      await trx("product_variants").where("product_id", id).update({
        is_deleted: true,
        updated_by: userId,
      });

      // Create new variants
      if (data.variants && data.variants.length > 0) {
        const variantData = data.variants.map((variant) => ({
          product_id: product.id,
          name: variant.name,
          mrp: variant.mrp,
          created_by: userId,
          updated_by: userId,
          is_deleted: false,
        }));

        await trx("product_variants").insert(variantData);
      }

      // Get the updated variants
      const variants = await trx("product_variants")
        .where("product_id", product.id)
        .where("is_deleted", false)
        .select("id", "name", "mrp")
        .orderBy("mrp");

      return {
        id: product.id,
        name: product.name,
        companyId: product.company_id,
        categoryId: product.category_id,
        variants: variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          mrp: parseFloat(variant.mrp),
        })),
        isOutOfStock: product.is_out_of_stock,
        availableInPieces: product.available_in_pieces,
        availableInPack: product.available_in_pack,
        packSize: product.pack_size,
        createdAt: product.created_at,
      };
    });
  }

  async deleteProduct(id: string, userId: string): Promise<boolean> {
    return await db.transaction(async (trx) => {
      // Soft delete product variants first
      await trx("product_variants")
        .where("product_id", id)
        .where("is_deleted", false) // Only soft-delete non-deleted variants
        .update({
          is_deleted: true,
          updated_by: userId,
        });

      // Soft delete product
      const deletedCount = await trx("products")
        .where("id", id)
        .where("is_deleted", false) // Only soft-delete non-deleted records
        .update({
          is_deleted: true,
          updated_by: userId,
        });

      return deletedCount > 0;
    });
  }

  async restoreProduct(id: string, userId: string): Promise<boolean> {
    return await db.transaction(async (trx) => {
      // Restore product variants first
      await trx("product_variants")
        .where("product_id", id)
        .where("is_deleted", true) // Only restore deleted variants
        .update({
          is_deleted: false,
          updated_by: userId,
        });

      // Restore product
      const restoredCount = await trx("products")
        .where("id", id)
        .where("is_deleted", true) // Only restore deleted records
        .update({
          is_deleted: false,
          updated_by: userId,
        });

      return restoredCount > 0;
    });
  }
}

export default new ProductService();
