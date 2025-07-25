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

console.log("\n=== Verification Complete ===");
