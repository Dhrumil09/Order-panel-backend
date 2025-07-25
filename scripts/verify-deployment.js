#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("=== Deployment Verification ===");
console.log("Current working directory:", process.cwd());
console.log("Node version:", process.version);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Check if dist directory exists
const distPath = path.join(process.cwd(), "dist");
console.log("\n=== Checking dist directory ===");
console.log("Dist path:", distPath);
console.log("Dist exists:", fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  console.log("Dist contents:", fs.readdirSync(distPath));

  // Check if index.js exists
  const indexPath = path.join(distPath, "index.js");
  console.log("\n=== Checking index.js ===");
  console.log("Index path:", indexPath);
  console.log("Index exists:", fs.existsSync(indexPath));

  if (fs.existsSync(indexPath)) {
    const stats = fs.statSync(indexPath);
    console.log("Index file size:", stats.size, "bytes");
    console.log("Index file modified:", stats.mtime);

    // Try to read the first few lines to verify it's valid
    try {
      const content = fs.readFileSync(indexPath, "utf8");
      console.log(
        "First 200 characters of index.js:",
        content.substring(0, 200)
      );
    } catch (error) {
      console.log("Error reading index.js:", error.message);
    }
  }
}

// Check package.json
console.log("\n=== Checking package.json ===");
const packagePath = path.join(process.cwd(), "package.json");
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  console.log("Main field:", packageJson.main);
  console.log("Start script:", packageJson.scripts?.start);
}

// Check environment variables
console.log("\n=== Checking Environment Variables ===");
const requiredEnvVars = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DATABASE_URL",
];
requiredEnvVars.forEach((varName) => {
  console.log(`${varName}: ${process.env[varName] ? "SET" : "NOT SET"}`);
});

console.log("\n=== Verification Complete ===");
