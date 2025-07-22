import createApp from "./app";
import { serverConfig, validateConfig } from "./utils/config";
import { testConnection, closeConnection } from "./db";

async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Test database connection
    await testConnection();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(serverConfig.port, () => {
      console.log(`🚀 Server running on port ${serverConfig.port}`);
      console.log(`📊 Environment: ${serverConfig.nodeEnv}`);
      console.log(
        `🔗 Health check: http://localhost:${serverConfig.port}/health`
      );
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await closeConnection();
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      server.close(async () => {
        await closeConnection();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();
