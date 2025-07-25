#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 Render Startup Script - Starting Order Panel Backend...");

// Debug information
console.log("📁 Current working directory:", process.cwd());
console.log("📁 Directory contents:");
try {
  const files = fs.readdirSync(".");
  console.log(files.join(" "));
} catch (error) {
  console.error("❌ Error reading directory:", error.message);
}

// Function to find the server file
function findServerFile() {
  const possiblePaths = [
    // Current directory
    path.join(process.cwd(), "dist", "index.js"),
    // One level up (in case we're in src)
    path.join(process.cwd(), "..", "dist", "index.js"),
    // Two levels up (in case we're in src/something)
    path.join(process.cwd(), "..", "..", "dist", "index.js"),
    // Relative paths
    "./dist/index.js",
    "../dist/index.js",
    "../../dist/index.js",
    // Absolute paths that Render might use
    "/opt/render/project/dist/index.js",
    "/opt/render/project/src/dist/index.js",
  ];

  console.log("🔍 Searching for server file...");

  for (const testPath of possiblePaths) {
    console.log(`  Testing: ${testPath}`);
    if (fs.existsSync(testPath)) {
      console.log(`✅ Found server at: ${testPath}`);
      return testPath;
    }
  }

  return null;
}

// Try to find the server file
let serverPath = findServerFile();

if (!serverPath) {
  console.error("❌ Could not find server file!");
  console.log("🔨 Attempting to build...");

  // Try to build
  const buildProcess = spawn("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true,
  });

  buildProcess.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Build successful, searching for server file again...");
      serverPath = findServerFile();

      if (serverPath) {
        startServer(serverPath);
      } else {
        console.error("❌ Still could not find server file after build!");
        process.exit(1);
      }
    } else {
      console.error("❌ Build failed with code:", code);
      process.exit(1);
    }
  });
} else {
  startServer(serverPath);
}

function startServer(serverPath) {
  console.log("🚀 Starting server with path:", serverPath);

  // Start the server
  const serverProcess = spawn("node", [serverPath], {
    stdio: "inherit",
    shell: true,
  });

  serverProcess.on("close", (code) => {
    console.log(`Server process exited with code: ${code}`);
    process.exit(code);
  });

  serverProcess.on("error", (error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
