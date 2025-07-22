import db from "../db";

export type HealthStatus = {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  database: "connected" | "disconnected";
  version: string;
};

export async function getHealthStatus(): Promise<HealthStatus> {
  let databaseStatus: "connected" | "disconnected" = "disconnected";

  try {
    await db.raw("SELECT 1");
    databaseStatus = "connected";
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  return {
    status: databaseStatus === "connected" ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: databaseStatus,
    version: process.env.npm_package_version || "1.0.0",
  };
}
