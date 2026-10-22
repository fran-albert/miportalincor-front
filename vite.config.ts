import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, normalizePath, type Plugin } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve("pdfjs-dist/package.json"));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, "cmaps"));

// Id del build: el commit en Vercel, la hora en un build local. El portal lo
// compara con /version.json para avisar que hay una versión nueva.
const appVersion =
  process.env.VERCEL_GIT_COMMIT_SHA || `local-${new Date().toISOString()}`;

const versionFilePlugin = (): Plugin => ({
  name: "incor-version-file",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ version: appVersion }),
    });
  },
});

export default defineConfig(({ mode }) => {
  // Determinar configuración específica del entorno
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  const isStaging = mode === 'staging';

  return {
    base: "/",
    mode,
    define: {
      __DEV__: isDevelopment,
      __STAGING__: isStaging,
      __PROD__: isProduction,
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
    },
    plugins: [
      react(),
      versionFilePlugin(),
      viteStaticCopy({
        targets: [
          {
            src: cMapsDir,
            dest: "",
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Configuraciones específicas por entorno
    build: {
      sourcemap: !isProduction,
      minify: isProduction,
      rollupOptions: isProduction ? {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
            charts: ['recharts'],
          },
        },
      } : undefined,
    },
    server: {
      port: 5173,
      host: true,
      open: isDevelopment,
    },
    preview: {
      port: 4173,
      host: true,
    },
    // Variables de entorno disponibles en el cliente
    envPrefix: 'VITE_',
  };
});
