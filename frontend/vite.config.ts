import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import * as path from "node:path";
import * as fs from "node:fs";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const rootDir = __dirname;
  const env = loadEnv(mode, rootDir, "");
  const isPublicBuild = mode === "public";
  return {
    root: rootDir,
    base: isPublicBuild ? "/smajpihub/" : "/",
    plugins: [
      react(),
      legacy({
        // Force legacy output for embedded/older webviews.
        targets: ["Android >= 5", "iOS >= 10"],
        renderLegacyChunks: true,
        modernPolyfills: true,
      }),
      {
        name: "html-env-replace",
        transformIndexHtml(html) {
          return html
            .replace(/\$\$BACKEND_URL\$\$/g, () => env.VITE_BACKEND_URL || "$$BACKEND_URL$$")
            .replace(/\$\$SANDBOX_SDK\$\$/g, env.VITE_SANDBOX_SDK || "true");
        },
      },
      {
        name: "github-pages-spa-fallback",
        closeBundle() {
          if (!isPublicBuild) {
            return;
          }

          const distDir = path.resolve(rootDir, "dist-public");
          const indexPath = path.join(distDir, "index.html");
          const fallbackPath = path.join(distDir, "404.html");

          if (fs.existsSync(indexPath)) {
            fs.copyFileSync(indexPath, fallbackPath);
          }
        },
      },
    ],
    resolve: {
      alias: {
        "@mui/styled-engine": path.resolve(__dirname, "node_modules/@mui/styled-engine-sc"),
      },
    },
    build: isPublicBuild
      ? {
          // GitHub Pages build output (uploaded by Actions workflow).
          outDir: "dist-public",
          assetsDir: "assets",
          emptyOutDir: true,
        }
      : undefined,
    server: {
      port: parseInt(env.PORT) || 3314,
    },
  };
});
