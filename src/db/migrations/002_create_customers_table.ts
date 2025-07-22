import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("customers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("shop_name").notNullable();
    table.string("owner_name").notNullable();
    table.string("owner_phone").notNullable();
    table.string("owner_email").notNullable();
    table.text("address").notNullable();
    table.string("area").notNullable();
    table.string("city").notNullable();
    table.string("state").notNullable();
    table.string("pincode").notNullable();
    table
      .enum("status", ["active", "inactive", "pending"])
      .defaultTo("pending");
    table.timestamp("registration_date").defaultTo(knex.fn.now());
    table.integer("total_orders").defaultTo(0);
    table.decimal("total_spent", 10, 2).defaultTo(0);
    table.text("notes");
    table.timestamps(true, true);

    // Indexes
    table.index("shop_name");
    table.index("owner_name");
    table.index("owner_phone");
    table.index("owner_email");
    table.index("area");
    table.index("city");
    table.index("state");
    table.index("status");
    table.index("registration_date");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("customers");
}
