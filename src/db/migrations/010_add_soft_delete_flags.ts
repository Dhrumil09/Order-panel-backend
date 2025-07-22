import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add isDeleted flag to customers table
  await knex.schema.alterTable("customers", (table) => {
    table.boolean("is_deleted").defaultTo(false);
    table.index("is_deleted");
  });

  // Add isDeleted flag to companies table
  await knex.schema.alterTable("companies", (table) => {
    table.boolean("is_deleted").defaultTo(false);
    table.index("is_deleted");
  });

  // Add isDeleted flag to categories table
  await knex.schema.alterTable("categories", (table) => {
    table.boolean("is_deleted").defaultTo(false);
    table.index("is_deleted");
  });

  // Add isDeleted flag to products table
  await knex.schema.alterTable("products", (table) => {
    table.boolean("is_deleted").defaultTo(false);
    table.index("is_deleted");
  });

  // Add isDeleted flag to product_variants table
  await knex.schema.alterTable("product_variants", (table) => {
    table.boolean("is_deleted").defaultTo(false);
    table.index("is_deleted");
  });

  // Add isDeleted flag to orders table
  await knex.schema.alterTable("orders", (table) => {
    table.boolean("is_deleted").defaultTo(false);
    table.index("is_deleted");
  });

  // Add isDeleted flag to order_items table
  await knex.schema.alterTable("order_items", (table) => {
    table.boolean("is_deleted").defaultTo(false);
    table.index("is_deleted");
  });

  // Add isDeleted flag to users table
  await knex.schema.alterTable("users", (table) => {
    table.boolean("is_deleted").defaultTo(false);
    table.index("is_deleted");
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove isDeleted flags from all tables
  await knex.schema.alterTable("customers", (table) => {
    table.dropColumn("is_deleted");
  });

  await knex.schema.alterTable("companies", (table) => {
    table.dropColumn("is_deleted");
  });

  await knex.schema.alterTable("categories", (table) => {
    table.dropColumn("is_deleted");
  });

  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("is_deleted");
  });

  await knex.schema.alterTable("product_variants", (table) => {
    table.dropColumn("is_deleted");
  });

  await knex.schema.alterTable("orders", (table) => {
    table.dropColumn("is_deleted");
  });

  await knex.schema.alterTable("order_items", (table) => {
    table.dropColumn("is_deleted");
  });

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("is_deleted");
  });
}
