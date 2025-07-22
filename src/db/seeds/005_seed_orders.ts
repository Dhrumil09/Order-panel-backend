import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Get customer and product IDs
  const customers = await knex("customers").select("id", "shop_name", "owner_name");
  const products = await knex("products").select("id", "name");
  const productVariants = await knex("product_variants").select("id", "product_id", "mrp");

  if (!customers.length || !products.length || !productVariants.length) {
    console.log("Required customers, products, or variants not found. Skipping order seed.");
    return;
  }

  // Deletes ALL existing entries
  await knex("order_items").del();
  await knex("orders").del();

  // Create sample orders
  const orders = await knex("orders").insert([
    {
      customer_id: customers[0].id,
      customer_name: customers[0].owner_name,
      customer_address: "123 MG Road, Koramangala, Bangalore, Karnataka 560034",
      customer_email: "rajesh.kumar@gmail.com",
      customer_phone: "+91 98765 43210",
      status: "delivered",
      order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      items_count: 2,
      total_amount: 598,
      shipping_method: "Express Delivery",
      tracking_number: "DTDC123456789",
      notes: "Customer requested signature confirmation"
    },
    {
      customer_id: customers[1].id,
      customer_name: customers[1].owner_name,
      customer_address: "456 Indiranagar Main Road, Bangalore, Karnataka 560038",
      customer_email: "priya.sharma@gmail.com",
      customer_phone: "+91 87654 32109",
      status: "shipped",
      order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      items_count: 1,
      total_amount: 199,
      shipping_method: "Standard Delivery",
      tracking_number: "DTDC987654321",
      notes: "Handle with care"
    },
    {
      customer_id: customers[0].id,
      customer_name: customers[0].owner_name,
      customer_address: "123 MG Road, Koramangala, Bangalore, Karnataka 560034",
      customer_email: "rajesh.kumar@gmail.com",
      customer_phone: "+91 98765 43210",
      status: "processing",
      order_date: new Date(),
      items_count: 3,
      total_amount: 897,
      shipping_method: "Express Delivery",
      notes: "Bulk order for office"
    }
  ]).returning("*");

  // Create order items
  const orderItems = [];

  // Order 1 items
  const product1 = products.find(p => p.name === "Premium Coffee Beans");
  const variant1 = productVariants.find(v => v.product_id === product1?.id && v.name === "250g");
  const variant2 = productVariants.find(v => v.product_id === product1?.id && v.name === "500g");

  if (product1 && variant1 && variant2) {
    orderItems.push(
      {
        order_id: orders[0].id,
        product_id: product1.id,
        product_variant_id: variant1.id,
        product_name: product1.name,
        quantity: 1,
        price: variant1.mrp,
        boxes: 1,
        pieces: null,
        pack: null,
        pack_size: 12,
        available_in_pieces: true,
        available_in_pack: true
      },
      {
        order_id: orders[0].id,
        product_id: product1.id,
        product_variant_id: variant2.id,
        product_name: product1.name,
        quantity: 1,
        price: variant2.mrp,
        boxes: 1,
        pieces: null,
        pack: null,
        pack_size: 12,
        available_in_pieces: true,
        available_in_pack: true
      }
    );
  }

  // Order 2 items
  const product2 = products.find(p => p.name === "Green Tea Leaves");
  const variant3 = productVariants.find(v => v.product_id === product2?.id && v.name === "100g");

  if (product2 && variant3) {
    orderItems.push({
      order_id: orders[1].id,
      product_id: product2.id,
      product_variant_id: variant3.id,
      product_name: product2.name,
      quantity: 1,
      price: variant3.mrp,
      boxes: null,
      pieces: 1,
      pack: null,
      pack_size: null,
      available_in_pieces: true,
      available_in_pack: false
    });
  }

  // Order 3 items
  if (product1 && variant1 && variant2) {
    orderItems.push(
      {
        order_id: orders[2].id,
        product_id: product1.id,
        product_variant_id: variant1.id,
        product_name: product1.name,
        quantity: 2,
        price: variant1.mrp,
        boxes: 2,
        pieces: null,
        pack: null,
        pack_size: 12,
        available_in_pieces: true,
        available_in_pack: true
      },
      {
        order_id: orders[2].id,
        product_id: product1.id,
        product_variant_id: variant2.id,
        product_name: product1.name,
        quantity: 1,
        price: variant2.mrp,
        boxes: 1,
        pieces: null,
        pack: null,
        pack_size: 12,
        available_in_pieces: true,
        available_in_pack: true
      }
    );
  }

  if (orderItems.length > 0) {
    await knex("order_items").insert(orderItems);
  }

  // Update customer totals
  await knex("customers")
    .where("id", customers[0].id)
    .update({
      total_orders: 2,
      total_spent: 1495 // 598 + 897
    });

  await knex("customers")
    .where("id", customers[1].id)
    .update({
      total_orders: 1,
      total_spent: 199
    });
} 