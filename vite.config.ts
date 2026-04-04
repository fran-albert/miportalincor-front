import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve("pdfjs-dist/package.json"));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, "cmaps"));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

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
      proxy: isDevelopment
        ? {
            "/proxy/hc": {
              target: env.VITE_LOCAL_PROXY_HC_TARGET,
              changeOrigin: true,
              secure: true,
              rewrite: (requestPath) =>
                requestPath.replace(/^\/proxy\/hc/, ""),
            },
            "/proxy/laboral/labor-report-branding-config": {
              target:
                env.VITE_LOCAL_PROXY_LABORAL_BRANDING_TARGET ||
                env.VITE_LOCAL_PROXY_LABORAL_TARGET,
              changeOrigin: true,
              secure: false,
              rewrite: (requestPath) =>
                requestPath.replace(/^\/proxy\/laboral/, "/api/v1"),
            },
            "/proxy/laboral": {
              target: env.VITE_LOCAL_PROXY_LABORAL_TARGET,
              changeOrigin: true,
              secure: true,
              rewrite: (requestPath) =>
                requestPath.replace(/^\/proxy\/laboral/, "/api/v1"),
            },
            "/proxy/turnos": {
              target: env.VITE_LOCAL_PROXY_TURNOS_TARGET,
              changeOrigin: true,
              secure: true,
              rewrite: (requestPath) =>
                requestPath.replace(/^\/proxy\/turnos/, "/api"),
            },
          }
        : undefined,
    },
    preview: {
      port: 4173,
      host: true,
    },
    // Variables de entorno disponibles en el cliente
    envPrefix: 'VITE_',
  };
});
