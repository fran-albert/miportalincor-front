// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PatientSummary } from "@/types/Prescription-Request/Prescription-Request";
import PatientInfoCard from "../PatientInfoCard";

const makePatient = (
  overrides: Partial<PatientSummary> = {}
): PatientSummary => ({
  id: "patient-1",
  firstName: "Veronica",
  lastName: "Robles",
  ...overrides,
});

describe("PatientInfoCard", () => {
  it("muestra nombre, telefono, obra social y afiliado cuando llegan en el payload", () => {
    render(
      <PatientInfoCard
        patient={makePatient({
          phoneNumber: "3515551234",
          healthInsuranceName: "OSDE",
          affiliationNumber: "AFF-123",
        })}
      />
    );

    expect(screen.getByText("Paciente")).toBeInTheDocument();
    expect(screen.getByText("Veronica Robles")).toBeInTheDocument();
    expect(screen.getByText("Tel: 3515551234")).toBeInTheDocument();
    expect(screen.getByText("Obra social: OSDE")).toBeInTheDocument();
    expect(screen.getByText("Nro. afiliado: AFF-123")).toBeInTheDocument();
  });

  it("usa healthPlans como fallback cuando no llega healthInsuranceName", () => {
    render(
      <PatientInfoCard
        patient={makePatient({
          healthPlans: [
            {
              id: 1,
              healthInsurance: {
                id: 7,
                name: "Swiss Medical",
              },
            },
          ],
        })}
      />
    );

    expect(
      screen.getByText("Obra social: Swiss Medical")
    ).toBeInTheDocument();
  });

  it("omite las lineas opcionales cuando el payload no las trae", () => {
    render(<PatientInfoCard patient={makePatient()} />);

    expect(screen.queryByText(/Tel:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Obra social:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nro. afiliado:/)).not.toBeInTheDocument();
  });
});
