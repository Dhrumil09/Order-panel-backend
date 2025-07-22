import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("products", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name").notNullable();
    table
      .uuid("company_id")
      .notNullable()
      .references("id")
      .inTable("companies")
      .onDelete("CASCADE");
    table
      .uuid("category_id")
      .notNullable()
      .references("id")
      .inTable("categories")
      .onDelete("CASCADE");
    table.boolean("is_out_of_stock").defaultTo(false);
    table.boolean("available_in_pieces").defaultTo(false);
    table.boolean("available_in_pack").defaultTo(false);
    table.integer("pack_size");
    table.timestamps(true, true);

    // Indexes
    table.index("name");
    table.index("company_id");
    table.index("category_id");
    table.index("is_out_of_stock");
    table.index("created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("products");
}
