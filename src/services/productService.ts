import db from "../db";
import {
  Product,
  CreateProductRequest,
  ProductQueryParams,
  ProductWithRelations,
} from "../../api-types";
import { PaginationInfo } from "../types";

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
      .leftJoin("categories as cat", "p.category_id", "cat.id");

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
    if (minPrice || maxPrice) {
      const subQuery = db("product_variants")
        .select(db.raw("MIN(mrp) as min_price, MAX(mrp) as max_price"))
        .where("product_id", db.ref("p.id"));

      if (minPrice) {
        query = query.whereExists(subQuery.where("min_price", ">=", minPrice));
      }
      if (maxPrice) {
        query = query.whereExists(subQuery.where("max_price", "<=", maxPrice));
      }
    }

    // Apply size filter
    if (sizeFilter) {
      query = query.whereExists(
        db("product_variants")
          .where("product_id", db.ref("p.id"))
          .whereILike("name", `%${sizeFilter}%`)
      );
    }

    // Get total count for pagination
    const countQuery = db("products as p")
      .leftJoin("companies as c", "p.company_id", "c.id")
      .leftJoin("categories as cat", "p.category_id", "cat.id");

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
    if (minPrice || maxPrice) {
      const subQuery = db("product_variants")
        .select(db.raw("MIN(mrp) as min_price, MAX(mrp) as max_price"))
        .where("product_id", db.ref("p.id"));

      if (minPrice) {
        countQuery.whereExists(subQuery.where("min_price", ">=", minPrice));
      }
      if (maxPrice) {
        countQuery.whereExists(subQuery.where("max_price", "<=", maxPrice));
      }
    }
    if (sizeFilter) {
      countQuery.whereExists(
        db("product_variants")
          .where("product_id", db.ref("p.id"))
          .whereILike("name", `%${sizeFilter}%`)
      );
    }

    const totalItems = await countQuery.count("* as count").first();
    const total = parseInt((totalItems?.count as string) || "0");

    // Apply sorting and pagination
    query = query.orderBy(sortBy, sortOrder).limit(limit).offset(offset);

    const products = await query;

    // Get variants for each product
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await db("product_variants")
          .where("product_id", product.id)
          .select("id", "name", "mrp")
          .orderBy("mrp");

        return {
          id: product.id,
          name: product.name,
          companyId: product.company_id,
          categoryId: product.category_id,
          variants: variants.map((v) => ({
            id: v.id,
            name: v.name,
            mrp: parseFloat(v.mrp),
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
      .first();

    if (!product) {
      return null;
    }

    const variants = await db("product_variants")
      .where("product_id", id)
      .select("id", "name", "mrp")
      .orderBy("mrp");

    return {
      id: product.id,
      name: product.name,
      companyId: product.company_id,
      categoryId: product.category_id,
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        mrp: parseFloat(v.mrp),
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

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const { variants, ...productData } = data;

    // Create product
    const [product] = await db("products")
      .insert({
        name: productData.name,
        company_id: productData.companyId,
        category_id: productData.categoryId,
        is_out_of_stock: productData.isOutOfStock,
        available_in_pieces: productData.availableInPieces,
        available_in_pack: productData.availableInPack,
        pack_size: productData.packSize,
      })
      .returning("*");

    // Create variants
    if (variants && variants.length > 0) {
      const variantData = variants.map((variant) => ({
        product_id: product.id,
        name: variant.name,
        mrp: variant.mrp,
      }));

      await db("product_variants").insert(variantData);
    }

    return {
      id: product.id,
      name: product.name,
      companyId: product.company_id,
      categoryId: product.category_id,
      variants: [], // Will be populated if needed
      isOutOfStock: product.is_out_of_stock,
      availableInPieces: product.available_in_pieces,
      availableInPack: product.available_in_pack,
      packSize: product.pack_size,
      createdAt: product.created_at,
    };
  }

  async updateProduct(
    id: string,
    data: CreateProductRequest
  ): Promise<Product | null> {
    const { variants, ...productData } = data;

    // Update product
    const [product] = await db("products")
      .where("id", id)
      .update({
        name: productData.name,
        company_id: productData.companyId,
        category_id: productData.categoryId,
        is_out_of_stock: productData.isOutOfStock,
        available_in_pieces: productData.availableInPieces,
        available_in_pack: productData.availableInPack,
        pack_size: productData.packSize,
      })
      .returning("*");

    if (!product) {
      return null;
    }

    // Update variants (delete existing and create new)
    await db("product_variants").where("product_id", id).del();

    if (variants && variants.length > 0) {
      const variantData = variants.map((variant) => ({
        product_id: product.id,
        name: variant.name,
        mrp: variant.mrp,
      }));

      await db("product_variants").insert(variantData);
    }

    return {
      id: product.id,
      name: product.name,
      companyId: product.company_id,
      categoryId: product.category_id,
      variants: [], // Will be populated if needed
      isOutOfStock: product.is_out_of_stock,
      availableInPieces: product.available_in_pieces,
      availableInPack: product.available_in_pack,
      packSize: product.pack_size,
      createdAt: product.created_at,
    };
  }

  async deleteProduct(id: string): Promise<boolean> {
    const deletedCount = await db("products").where("id", id).del();
    return deletedCount > 0;
  }
}

export default new ProductService();
