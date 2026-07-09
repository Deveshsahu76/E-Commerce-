const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

process.env.CI = "false";
process.env.GENERATE_SOURCEMAP = "false";
process.env.DISABLE_ESLINT_PLUGIN = "true";
process.env.ESLINT_NO_DEV_ERRORS = "true";

console.log("========== VERCEL BUILD DEBUG ==========");
console.log("cwd:", process.cwd());
console.log("node:", process.version);
console.log("CI:", process.env.CI);
console.log("GENERATE_SOURCEMAP:", process.env.GENERATE_SOURCEMAP);
console.log("DISABLE_ESLINT_PLUGIN:", process.env.DISABLE_ESLINT_PLUGIN);

const requiredFiles = [
  "package.json",
  "src/App.js",
  "src/index.js",
  "src/pages/Admin/AdminPanel.jsx",
  "src/pages/Admin/admin.css",
];

for (const file of requiredFiles) {
  const fullPath = path.join(process.cwd(), file);
  console.log(`${file}: ${fs.existsSync(fullPath) ? "OK" : "MISSING"}`);
}

const buildScript = path.join(
  process.cwd(),
  "node_modules",
  "react-scripts",
  "scripts",
  "build.js"
);

if (!fs.existsSync(buildScript)) {
  console.error("react-scripts build script missing:", buildScript);
  process.exit(1);
}

console.log("Starting react-scripts build...");
console.log("========================================");

const result = spawnSync(process.execPath, [buildScript], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error("Build spawn error:", result.error);
  process.exit(1);
}

console.log("React build exit status:", result.status);
process.exit(result.status || 0);