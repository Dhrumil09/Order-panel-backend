const path = require("path");
const knex = require("knex");
require("dotenv").config();

// Function to create database connection
function createDbConnection() {
  // If DATABASE_URL is provided, use it (Neon DB)
  if (process.env.DATABASE_URL) {
    console.log("🔗 Using DATABASE_URL for Neon DB connection");
    return knex({
      client: "postgresql",
      connection: process.env.DATABASE_URL,
      pool: {
        min: 2,
        max: 10,
      },
      migrations: {
        directory: path.join(__dirname, "../src/db/migrations"),
        extension: "ts",
      },
      seeds: {
        directory: path.join(__dirname, "../src/db/seeds"),
      },
    });
  }

  // Fallback to individual connection parameters
  console.log("🔗 Using individual connection parameters");
  return knex({
    client: "postgresql",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "order_panel",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, "../src/db/migrations"),
      extension: "ts",
    },
    seeds: {
      directory: path.join(__dirname, "../src/db/seeds"),
    },
  });
}

async function testNeonConnection() {
  const db = createDbConnection();

  try {
    console.log("🔍 Testing Neon DB connection...");

    // Test basic connection
    await db.raw("SELECT 1");
    console.log("✅ Database connection successful!");

    // Get database info
    const dbInfo = await db.raw(
      "SELECT current_database(), current_user, version()"
    );
    console.log("📊 Database:", dbInfo.rows[0].current_database);
    console.log("👤 User:", dbInfo.rows[0].current_user);
    console.log("🔧 PostgreSQL Version:", dbInfo.rows[0].version.split(" ")[0]);

    // Check if migrations table exists and list migrations
    const migrations = await db.migrate.list();
    console.log("📋 Applied migrations:", migrations[0].length);

    if (migrations[0].length > 0) {
      console.log("📝 Migration files:");
      migrations[0].forEach((migration, index) => {
        console.log(`   ${index + 1}. ${migration}`);
      });
    }

    // Check if key tables exist
    const tables = [
      "users",
      "customers",
      "products",
      "orders",
      "categories",
      "companies",
    ];
    console.log("\n📋 Checking table existence:");

    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      console.log(`   ${exists ? "✅" : "❌"} ${table}`);
    }

    // Check if there's data in tables
    console.log("\n📊 Checking table data:");
    for (const table of tables) {
      try {
        const count = await db(table).count("* as count").first();
        console.log(`   📈 ${table}: ${count?.count || 0} records`);
      } catch (error) {
        console.log(`   ❌ ${table}: Table doesn't exist`);
      }
    }

    console.log("\n🎉 Neon DB connection test completed successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Check your .env file has correct DATABASE_URL");
    console.log("2. Verify your Neon DB credentials are correct");
    console.log("3. Ensure your Neon DB is active and accessible");
    console.log("4. Check if your IP is whitelisted (if required)");
    console.log("5. Verify SSL settings in your connection string");

    if (error.code === "ECONNREFUSED") {
      console.log(
        "\n💡 This looks like a connection issue. Check your DATABASE_URL format:"
      );
      console.log(
        "   postgresql://username:password@host:port/database?sslmode=require"
      );
    }
  } finally {
    await db.destroy();
  }
}

// Run the test
testNeonConnection();
