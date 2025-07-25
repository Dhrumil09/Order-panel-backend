#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 Starting Order Panel Backend...");

// Debug information
console.log("📁 Current working directory:", process.cwd());
console.log("📁 Directory contents:");
try {
  const files = fs.readdirSync(".");
  console.log(files.join(" "));
} catch (error) {
  console.error("❌ Error reading directory:", error.message);
}

// Check for dist directory
const distPath = path.join(process.cwd(), "dist");
console.log("🔍 Checking for dist directory at:", distPath);

if (!fs.existsSync(distPath)) {
  console.error("❌ dist directory not found!");
  console.log("🔨 Attempting to build...");

  const buildProcess = spawn("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true,
  });

  buildProcess.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Build successful, starting server...");
      startServer();
    } else {
      console.error("❌ Build failed with code:", code);
      process.exit(1);
    }
  });
} else {
  console.log("✅ dist directory found");

  // Check for index.js
  const indexPath = path.join(distPath, "index.js");
  if (fs.existsSync(indexPath)) {
    console.log("✅ dist/index.js found");
    startServer();
  } else {
    console.error("❌ dist/index.js not found!");
    console.log("🔨 Attempting to build...");

    const buildProcess = spawn("npm", ["run", "build"], {
      stdio: "inherit",
      shell: true,
    });

    buildProcess.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Build successful, starting server...");
        startServer();
      } else {
        console.error("❌ Build failed with code:", code);
        process.exit(1);
      }
    });
  }
}

function startServer() {
  console.log("🚀 Starting server...");

  // Try different possible paths
  const possiblePaths = [
    path.join(process.cwd(), "dist", "index.js"),
    path.join(process.cwd(), "src", "dist", "index.js"),
    "./dist/index.js",
    "dist/index.js",
  ];

  let serverPath = null;
  for (const testPath of possiblePaths) {
    console.log(`🔍 Testing path: ${testPath}`);
    if (fs.existsSync(testPath)) {
      serverPath = testPath;
      console.log(`✅ Found server at: ${serverPath}`);
      break;
    }
  }

  if (!serverPath) {
    console.error("❌ Could not find server file in any expected location!");
    console.log("📁 Available files in dist:");
    try {
      const distFiles = fs.readdirSync(distPath);
      console.log(distFiles.join(" "));
    } catch (error) {
      console.error("Error reading dist directory:", error.message);
    }
    process.exit(1);
  }

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
