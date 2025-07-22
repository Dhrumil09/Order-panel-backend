import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add user tracking fields to customers table
  await knex.schema.alterTable("customers", (table) => {
    table
      .uuid("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .uuid("updated_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
  });

  // Add user tracking fields to companies table
  await knex.schema.alterTable("companies", (table) => {
    table
      .uuid("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .uuid("updated_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
  });

  // Add user tracking fields to categories table
  await knex.schema.alterTable("categories", (table) => {
    table
      .uuid("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .uuid("updated_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
  });

  // Add user tracking fields to products table
  await knex.schema.alterTable("products", (table) => {
    table
      .uuid("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .uuid("updated_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
  });

  // Add user tracking fields to product_variants table
  await knex.schema.alterTable("product_variants", (table) => {
    table
      .uuid("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .uuid("updated_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
  });

  // Add user tracking fields to orders table
  await knex.schema.alterTable("orders", (table) => {
    table
      .uuid("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .uuid("updated_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
  });

  // Add user tracking fields to order_items table
  await knex.schema.alterTable("order_items", (table) => {
    table
      .uuid("created_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
    table
      .uuid("updated_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove user tracking fields from all tables
  await knex.schema.alterTable("customers", (table) => {
    table.dropColumn("created_by");
    table.dropColumn("updated_by");
  });

  await knex.schema.alterTable("companies", (table) => {
    table.dropColumn("created_by");
    table.dropColumn("updated_by");
  });

  await knex.schema.alterTable("categories", (table) => {
    table.dropColumn("created_by");
    table.dropColumn("updated_by");
  });

  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("created_by");
    table.dropColumn("updated_by");
  });

  await knex.schema.alterTable("product_variants", (table) => {
    table.dropColumn("created_by");
    table.dropColumn("updated_by");
  });

  await knex.schema.alterTable("orders", (table) => {
    table.dropColumn("created_by");
    table.dropColumn("updated_by");
  });

  await knex.schema.alterTable("order_items", (table) => {
    table.dropColumn("created_by");
    table.dropColumn("updated_by");
  });
}
