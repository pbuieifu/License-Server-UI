import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Read JSON file
const configPath = path.resolve(
  __dirname,
  "./public/configuration/Environment.json"
);
const configFile = JSON.parse(fs.readFileSync(configPath, "utf8"));
const applicationWebRoot = configFile.api.application_webroot || "/";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: applicationWebRoot,
    define: {
      applicationWebRoot: JSON.stringify(applicationWebRoot),
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/index.js`,
        },
      },
      minify: true,
    },
    plugins: [react()],
    server: {
      cors: true,
    },
  };
});
