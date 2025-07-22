import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("customers").del();

  // Inserts seed entries
  await knex("customers").insert([
    {
      shop_name: "Kumar Electronics",
      owner_name: "Rajesh Kumar",
      owner_phone: "+91 98765 43210",
      owner_email: "rajesh.kumar@gmail.com",
      address: "123 MG Road, Koramangala",
      area: "Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      status: "active",
      total_orders: 45,
      total_spent: 125000,
      notes: "Premium customer, prefers express delivery",
    },
    {
      shop_name: "Tech Solutions",
      owner_name: "Priya Sharma",
      owner_phone: "+91 87654 32109",
      owner_email: "priya.sharma@gmail.com",
      address: "456 Indiranagar Main Road",
      area: "Indiranagar",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560038",
      status: "active",
      total_orders: 32,
      total_spent: 89000,
      notes: "Regular customer, bulk orders",
    },
    {
      shop_name: "Digital World",
      owner_name: "Amit Patel",
      owner_phone: "+91 76543 21098",
      owner_email: "amit.patel@gmail.com",
      address: "789 Whitefield Road",
      area: "Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560066",
      status: "pending",
      total_orders: 0,
      total_spent: 0,
      notes: "New customer, needs follow-up",
    },
  ]);
}
