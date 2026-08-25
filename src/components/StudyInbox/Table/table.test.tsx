// @vitest-environment jsdom
// ============================================================
// Las pestañas de "Estudios recibidos" son el diseño de referencia del portal:
// pastilla blanca con borde, verde institucional cuando está activa, y el
// contador en un badge que invierte los colores para seguir leyéndose sobre el
// verde. Francisco pidió el 25/08 que "Sin dueño" se vea igual.
//
// Este test es la red de no-regresión de esa pantalla: el patrón se extrajo a
// un componente compartido y acá se verifica que "Estudios recibidos" quedó
// exactamente como estaba.
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/hooks/Toast/toast-context";
import { StudyInboxScreen } from "./table";

const getStudyInbox = vi.fn();
const getStudyInboxCounts = vi.fn();

vi.mock("@/api/StudyInbox/get-study-inbox.action", () => ({
  getStudyInbox: (params: unknown) => getStudyInbox(params) as unknown,
}));
vi.mock("@/api/StudyInbox/get-study-inbox-counts.action", () => ({
  getStudyInboxCounts: () => getStudyInboxCounts() as unknown,
}));
vi.mock("@/config/environment", () => ({
  environment: { API_INCOR_HC_URL: "https://api.test", NODE_ENV: "development" },
  currentConfig: { enableLogging: false, enableDevTools: false },
  isDevelopment: () => true,
  isStaging: () => false,
  isProduction: () => false,
}));

afterEach(() => vi.clearAllMocks());

const renderScreen = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <ToastProvider>
        <QueryClientProvider client={client}>
          <StudyInboxScreen />
        </QueryClientProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
};

describe("StudyInboxScreen — pestañas", () => {
  it("mantiene las cinco pestañas con el contador sólo en las que piden trabajo", async () => {
    getStudyInbox.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });
    getStudyInboxCounts.mockResolvedValue({
      counts: {
        LISTO_PARA_CONFIRMAR: 7,
        REQUIERE_REVISION: 2,
        DUPLICADO: 1,
        CARGADO: 340,
        DESCARTADO: 15,
      },
    });

    renderScreen();

    expect(
      await screen.findByRole("tab", { name: /Para confirmar\s*7/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Para revisar\s*2/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Duplicados\s*1/i })).toBeInTheDocument();
    // Cargados y descartados son archivo: el número no decide nada y no va.
    expect(screen.getByRole("tab", { name: "Cargados" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Descartados" })).toBeInTheDocument();
  });

  it("conserva el diseño de pastilla y el verde institucional en la activa", async () => {
    getStudyInbox.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });
    getStudyInboxCounts.mockResolvedValue({
      counts: {
        LISTO_PARA_CONFIRMAR: 7,
        REQUIERE_REVISION: 0,
        DUPLICADO: 0,
        CARGADO: 0,
        DESCARTADO: 0,
      },
    });

    renderScreen();

    const activa = await screen.findByRole("tab", { name: /Para confirmar/i });
    expect(activa).toHaveAttribute("data-state", "active");
    expect(activa.className).toContain("rounded-lg");
    expect(activa.className).toContain("border-gray-200");
    expect(activa.className).toContain("bg-white");
    expect(activa.className).toContain("shadow-sm");
    expect(activa.className).toContain("px-4");
    expect(activa.className).toContain("py-2");
    expect(activa.className).toContain("text-gray-600");
    expect(activa.className).toContain("hover:border-greenPrimary/40");
    expect(activa.className).toContain("hover:text-greenPrimary");
    expect(activa.className).toContain("data-[state=active]:border-greenPrimary");
    expect(activa.className).toContain("data-[state=active]:bg-greenPrimary");
    expect(activa.className).toContain("data-[state=active]:text-white");

    // El TabsList: pastillas alineadas a la izquierda, sin el fondo gris del
    // segmented control por defecto.
    const lista = screen.getByRole("tablist");
    expect(lista.className).toContain("h-auto");
    expect(lista.className).toContain("flex-wrap");
    expect(lista.className).toContain("justify-start");
    expect(lista.className).toContain("gap-2");
    expect(lista.className).toContain("bg-transparent");
  });

  it("el contador de la pestaña activa invierte los colores para seguir leyéndose", async () => {
    getStudyInbox.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });
    getStudyInboxCounts.mockResolvedValue({
      counts: {
        LISTO_PARA_CONFIRMAR: 7,
        REQUIERE_REVISION: 0,
        DUPLICADO: 0,
        CARGADO: 0,
        DESCARTADO: 0,
      },
    });

    renderScreen();

    const contador = await screen.findByText("7");
    // Sin esta inversión el badge queda gris claro sobre verde: ilegible.
    await waitFor(() =>
      expect(contador.className).toContain(
        "group-data-[state=active]:bg-white",
      ),
    );
    expect(contador.className).toContain(
      "group-data-[state=active]:text-greenPrimary",
    );
    // El `group` tiene que estar en el trigger o la inversión nunca dispara.
    expect(contador.closest('[role="tab"]')?.className).toContain("group");
  });
});
