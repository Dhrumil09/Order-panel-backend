import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex("users").del();

  // Insert sample users
  await knex("users").insert([
    {
      email: "admin@example.com",
      name: "Admin User",
      password_hash: "$2b$10$example.hash.for.demo.purposes.only",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      email: "user@example.com",
      name: "Regular User",
      password_hash: "$2b$10$example.hash.for.demo.purposes.only",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log("✅ Sample data seeded successfully");
}
