import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("companies").del();

  // Inserts seed entries
  await knex("companies").insert([
    { name: "Coffee Co." },
    { name: "Tea Masters" },
    { name: "Snack World" },
    { name: "Beverage Plus" },
    { name: "Organic Foods" },
  ]);
}
