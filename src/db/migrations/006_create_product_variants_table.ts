import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("product_variants", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("product_id")
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
    table.string("name").notNullable(); // e.g., "250g", "500g"
    table.decimal("mrp", 10, 2).notNullable();
    table.timestamps(true, true);

    // Indexes
    table.index("product_id");
    table.index("name");
    table.index("mrp");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("product_variants");
}
