const path = require("path");
const knex = require("knex");
require("dotenv").config();

const db = knex({
  client: "postgresql",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "order_panel",
  },
  migrations: {
    directory: path.join(__dirname, "../src/db/migrations"),
    extension: "ts", // since you're using .ts files
  },
});

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...");
    console.log(`📊 Database: ${process.env.DB_NAME || "order_panel"}`);
    console.log(
      `🏠 Host: ${process.env.DB_HOST || "localhost"}:${
        process.env.DB_PORT || 5432
      }`
    );

    await db.raw("SELECT 1");
    console.log("✅ Database connection successful!");

    // Check if migrations table exists and list migrations
    const migrations = await db.migrate.list();
    console.log("📋 Applied migrations:", migrations[0].length);

    // Check if users table exists
    const hasUsersTable = await db.schema.hasTable("users");
    console.log("👥 Users table exists:", hasUsersTable);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Make sure PostgreSQL is running");
    console.log("2. Check your .env file has correct database credentials");
    console.log('3. Ensure the database "order_panel" exists');
    console.log("4. Verify the user has proper permissions");
  } finally {
    await db.destroy();
  }
}

testConnection();
