import { getHealthStatus } from "../healthService";

describe("HealthService", () => {
  describe("getHealthStatus", () => {
    it("should return health status with correct structure", async () => {
      const healthStatus = await getHealthStatus();

      expect(healthStatus).toHaveProperty("status");
      expect(healthStatus).toHaveProperty("timestamp");
      expect(healthStatus).toHaveProperty("uptime");
      expect(healthStatus).toHaveProperty("database");
      expect(healthStatus).toHaveProperty("version");

      expect(typeof healthStatus.status).toBe("string");
      expect(["healthy", "unhealthy"]).toContain(healthStatus.status);
      expect(typeof healthStatus.timestamp).toBe("string");
      expect(typeof healthStatus.uptime).toBe("number");
      expect(["connected", "disconnected"]).toContain(healthStatus.database);
      expect(typeof healthStatus.version).toBe("string");
    });

    it("should return valid timestamp", async () => {
      const healthStatus = await getHealthStatus();
      const timestamp = new Date(healthStatus.timestamp);

      expect(timestamp.getTime()).not.toBeNaN();
      expect(timestamp).toBeInstanceOf(Date);
    });
  });
});
