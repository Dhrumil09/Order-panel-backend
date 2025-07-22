import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("categories").del();

  // Inserts seed entries
  await knex("categories").insert([
    { name: "Beverages" },
    { name: "Snacks" },
    { name: "Dairy" },
    { name: "Bakery" },
    { name: "Organic" },
  ]);
}
