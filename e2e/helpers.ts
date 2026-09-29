import { Page, Route } from "@playwright/test";

export const HC_ORIGIN = "http://hc.e2e.test";
export const TURNOS_ORIGIN = "http://turnos.e2e.test";

/** JWT sin firma válida: el front solo lo decodifica (roles, exp). */
export const fakeJwt = (payload: {
  id: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
}): string => {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    email: "",
    iss: "e2e",
    ...payload,
    exp,
  })}.firma-e2e`;
};

export const loginAs = async (page: Page, token: string) => {
  const exp = String(Date.now() + 60 * 60 * 1000);
  await page.addInitScript(
    ([t, e]) => {
      window.localStorage.setItem("rememberMe", "true");
      window.localStorage.setItem("authToken", t);
      window.localStorage.setItem("tokenExpiration", e);
    },
    [token, exp]
  );
};

type Handler = (route: Route) => Promise<void> | void;

export const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

/**
 * Intercepta todo lo que va a las APIs. Lo que no tiene handler propio
 * responde vacío, para que las pantallas del portal carguen sin backend.
 */
export const mockApis = async (
  page: Page,
  handlers: Record<string, Handler>
) => {
  const fallback: Handler = (route) =>
    json(route, route.request().method() === "GET" ? [] : {});

  for (const origin of [HC_ORIGIN, TURNOS_ORIGIN, "http://laboral.e2e.test"]) {
    await page.route(`${origin}/**`, async (route) => {
      const url = new URL(route.request().url());
      const key = `${route.request().method()} ${url.origin}${url.pathname}`;
      const handler = handlers[key];
      return handler ? handler(route) : fallback(route);
    });
  }
};

export const STATES = [
  { id: 1, name: "Buenos Aires", country: { id: 1, name: "Argentina" } },
  { id: 22, name: "Santa Fe", country: { id: 1, name: "Argentina" } },
];

export const CITIES_SANTA_FE = [
  { id: 2104, name: "Rosario", state: STATES[1] },
  { id: 2200, name: "Firmat", state: STATES[1] },
];

export const HEALTH_INSURANCES = [
  {
    id: 3,
    name: "Galeno",
    requiresAffiliationNumber: true,
    plans: [
      { id: 3, name: "Oro" },
      { id: 4, name: "Azul" },
    ],
  },
  {
    id: 1,
    name: "OSDE",
    requiresAffiliationNumber: true,
    plans: [{ id: 1, name: "Plan 210" }],
  },
  {
    id: 40,
    name: "PARTICULAR",
    requiresAffiliationNumber: false,
    plans: [{ id: 40, name: "PARTICULAR" }],
  },
];
