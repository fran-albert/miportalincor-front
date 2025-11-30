import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve("pdfjs-dist/package.json"));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, "cmaps"));

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
    },
    plugins: [
      react(),
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
