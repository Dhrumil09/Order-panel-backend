import knex from "knex";
import { databaseConfig } from "../utils/config";

const db = knex({
  client: "postgresql",
  connection: {
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./src/db/migrations",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
});

export async function testConnection(): Promise<void> {
  try {
    await db.raw("SELECT 1");
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export async function closeConnection(): Promise<void> {
  await db.destroy();
}

export default db;
