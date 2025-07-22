import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("order_items", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("order_id")
      .notNullable()
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");
    table
      .uuid("product_id")
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
    table
      .uuid("product_variant_id")
      .notNullable()
      .references("id")
      .inTable("product_variants")
      .onDelete("CASCADE");
    table.string("product_name").notNullable();
    table.integer("quantity").notNullable().defaultTo(1);
    table.decimal("price", 10, 2).notNullable();
    table.integer("boxes");
    table.integer("pieces");
    table.integer("pack");
    table.integer("pack_size");
    table.boolean("available_in_pieces").defaultTo(false);
    table.boolean("available_in_pack").defaultTo(false);
    table.timestamps(true, true);

    // Indexes
    table.index("order_id");
    table.index("product_id");
    table.index("product_variant_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("order_items");
}
