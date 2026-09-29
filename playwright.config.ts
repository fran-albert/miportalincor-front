import { defineConfig, devices } from "@playwright/test";
import { HC_ORIGIN, TURNOS_ORIGIN } from "./e2e/helpers";

// Toda llamada a las APIs se intercepta en el navegador con page.route: las
// URLs apuntan a orígenes inexistentes para que nada se escape a un backend.
const PORT = 5180;

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "celular", use: { ...devices["Pixel 7"] } },
    {
      name: "escritorio",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `npx vite --mode development --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/iniciar-sesion`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      VITE_NODE_ENV: "development",
      VITE_BACKEND_API_INCOR_HC: `${HC_ORIGIN}/`,
      VITE_BACKEND_INCOR_LABORAL_API: "http://laboral.e2e.test/",
      VITE_BACKEND_API_TURNOS: `${TURNOS_ORIGIN}/`,
      VITE_BASE_URL: `http://localhost:${PORT}/`,
    },
  },
});
