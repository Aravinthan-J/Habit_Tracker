/**
 * Simple JavaScript server for deployment
 * Bypasses TypeScript compilation issues
 */

require("dotenv").config();
const { createApp } = require("./dist/app.js");
const {
  connectDatabase,
  disconnectDatabase,
} = require("./dist/config/database.js");

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(process.env.PORT || 3000, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🚀 Habit Tracker API Server Running                     ║
╠═══════════════════════════════════════════════════════════╣
║   Environment: ${process.env.NODE_ENV?.padEnd(24) || "development"}                 ║
║   Port: ${(process.env.PORT || 3000).toString().padEnd(30)}                 ║
║   URL: http://localhost:${(process.env.PORT || 3000).toString().padEnd(18)} ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed");
        await disconnectDatabase();
        console.log("✅ Graceful shutdown completed");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
