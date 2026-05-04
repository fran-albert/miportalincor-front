import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import EvolutionSection from ".";
import { EvolucionesResponse } from "@/types/Antecedentes/Antecedentes";
import { Patient } from "@/types/Patient/Patient";

vi.mock("@/hooks/useRoles", () => ({
  default: () => ({
    session: { id: "79", role: ["Medico"] },
  }),
}));

vi.mock("@/components/Evoluciones/Create", () => ({
  default: () => null,
}));

const patient = {
  id: "patient-1",
  userId: 758,
  firstName: "DANIEL",
  lastName: "NASAZZI",
  slug: "nasazzi-daniel-758",
} as unknown as Patient;

const importedEvoluciones = {
  evoluciones: [
    {
      id: "evolution-1",
      createdAt: "2026-05-04T12:00:00.000Z",
      updatedAt: "2026-05-04T12:00:00.000Z",
      deletedAt: null,
      doctor: null,
      data: [
        {
          id: "data-1",
          createdAt: "2026-05-04T12:00:00.000Z",
          updatedAt: "2026-05-04T12:00:00.000Z",
          deletedAt: null,
          value: "Médico original: INCOR S.R.L. (no registrado en el sistema)",
          observaciones: null,
          dataType: {
            id: "type-1",
            createdAt: "2026-05-04T12:00:00.000Z",
            updatedAt: "2026-05-04T12:00:00.000Z",
            deletedAt: null,
            name: "Evolución Importada (SFS)",
            category: "EVOLUCION",
            dataType: "STRING",
          },
        },
      ],
    },
  ],
} as unknown as EvolucionesResponse;

describe("EvolutionSection", () => {
  it("renderiza evoluciones importadas sin médico sin romper", () => {
    render(
      <MemoryRouter>
        <EvolutionSection
          userData={patient}
          evoluciones={importedEvoluciones}
          allowNewEvolutions={false}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Médico no registrado")).toBeInTheDocument();
    expect(screen.getByText("SFS")).toBeInTheDocument();
    expect(
      screen.getByText(/Médico original: INCOR S\.R\.L\./)
    ).toBeInTheDocument();
  });
});
