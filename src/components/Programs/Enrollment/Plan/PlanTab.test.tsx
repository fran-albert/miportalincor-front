// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PlanTab from "./PlanTab";

// La API devuelve validFrom/validTo como fecha calendario ("YYYY-MM-DD").
// Caso real del 2026-09-28: la versión 4 de un plan de OBESIDAD regía desde
// el 02/09 y la pantalla mostraba "Desde 01/09/2026".
vi.mock("@/hooks/Program/useProgramMembership", () => ({
  useProgramMembership: () => ({ isCoordinator: true, isAdmin: false }),
}));

vi.mock("@/hooks/Program/useCurrentPlan", () => ({
  useCurrentPlan: () => ({
    currentPlan: {
      id: "v4",
      version: 4,
      validFrom: "2026-09-02",
      validTo: null,
      activities: [],
    },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/Program/usePlanVersions", () => ({
  usePlanVersions: () => ({
    planVersions: [
      { id: "v4", version: 4, validFrom: "2026-09-02", validTo: null },
      { id: "v3", version: 3, validFrom: "2026-08-11", validTo: "2026-09-01" },
    ],
  }),
}));

vi.mock("./CreatePlanVersionDialog", () => ({ default: () => null }));

afterEach(cleanup);

describe("PlanTab", () => {
  it("muestra la vigencia del plan actual en el día que devuelve la API", () => {
    render(<PlanTab programId="p1" enrollmentId="e1" activities={[]} />);

    expect(screen.getByText(/Desde\s+02\/09\/2026/)).toBeTruthy();
    // "Hasta 01/09/2026" es legítimo (cierre de la versión 3); lo que no puede
    // aparecer es la vigencia actual corrida un día.
    expect(screen.queryByText(/Desde\s+01\/09\/2026/)).toBeNull();
  });

  it("muestra desde y hasta de las versiones anteriores sin correr el día", () => {
    render(<PlanTab programId="p1" enrollmentId="e1" activities={[]} />);

    expect(screen.getByText(/Versión 3 — Desde\s+11\/08\/2026/)).toBeTruthy();
    expect(screen.getByText(/Hasta\s+01\/09\/2026/)).toBeTruthy();
    expect(screen.queryByText(/10\/08\/2026/)).toBeNull();
  });
});
