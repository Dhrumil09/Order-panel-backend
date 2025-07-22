import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("users").del();

  // Hash passwords
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const userPassword = await bcrypt.hash("user123", saltRounds);

  // Inserts seed entries
  await knex("users").insert([
    {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
    },
    {
      name: "Regular User",
      email: "user@example.com",
      password: userPassword,
    },
  ]);
}
