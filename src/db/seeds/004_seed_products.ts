import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Get company and category IDs
  const companies = await knex("companies").select("id", "name");
  const categories = await knex("categories").select("id", "name");

  const coffeeCo = companies.find((c) => c.name === "Coffee Co.");
  const teaMasters = companies.find((c) => c.name === "Tea Masters");
  const beverages = categories.find((c) => c.name === "Beverages");
  const snacks = categories.find((c) => c.name === "Snacks");

  if (!coffeeCo || !teaMasters || !beverages || !snacks) {
    console.log(
      "Required companies or categories not found. Skipping product seed."
    );
    return;
  }

  // Deletes ALL existing entries
  await knex("product_variants").del();
  await knex("products").del();

  // Insert products
  const products = await knex("products")
    .insert([
      {
        name: "Premium Coffee Beans",
        company_id: coffeeCo.id,
        category_id: beverages.id,
        is_out_of_stock: false,
        available_in_pieces: true,
        available_in_pack: true,
        pack_size: 12,
      },
      {
        name: "Green Tea Leaves",
        company_id: teaMasters.id,
        category_id: beverages.id,
        is_out_of_stock: false,
        available_in_pieces: true,
        available_in_pack: false,
        pack_size: null,
      },
      {
        name: "Coffee Powder",
        company_id: coffeeCo.id,
        category_id: beverages.id,
        is_out_of_stock: true,
        available_in_pieces: true,
        available_in_pack: true,
        pack_size: 24,
      },
    ])
    .returning("*");

  // Insert variants for each product
  const variants = [];

  // Premium Coffee Beans variants
  variants.push(
    { product_id: products[0].id, name: "250g", mrp: 299 },
    { product_id: products[0].id, name: "500g", mrp: 499 },
    { product_id: products[0].id, name: "1kg", mrp: 899 }
  );

  // Green Tea Leaves variants
  variants.push(
    { product_id: products[1].id, name: "100g", mrp: 199 },
    { product_id: products[1].id, name: "250g", mrp: 399 }
  );

  // Coffee Powder variants
  variants.push(
    { product_id: products[2].id, name: "200g", mrp: 249 },
    { product_id: products[2].id, name: "500g", mrp: 549 }
  );

  await knex("product_variants").insert(variants);
}
