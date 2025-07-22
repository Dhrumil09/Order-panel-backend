import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("orders", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("customer_id")
      .notNullable()
      .references("id")
      .inTable("customers")
      .onDelete("CASCADE");
    table.string("customer_name").notNullable();
    table.text("customer_address").notNullable();
    table.string("customer_email");
    table.string("customer_phone");
    table
      .enum("status", [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ])
      .defaultTo("pending");
    table.timestamp("order_date").defaultTo(knex.fn.now());
    table.integer("items_count").defaultTo(0);
    table.decimal("total_amount", 10, 2).defaultTo(0);
    table.string("shipping_method");
    table.string("tracking_number");
    table.text("notes");
    table.timestamps(true, true);

    // Indexes
    table.index("customer_id");
    table.index("customer_name");
    table.index("status");
    table.index("order_date");
    table.index("customer_email");
    table.index("customer_phone");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("orders");
}
