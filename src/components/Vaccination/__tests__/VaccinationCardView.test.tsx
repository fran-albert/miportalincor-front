// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VaccinationCardView } from "../VaccinationCardView";
import type { VaccinationCard } from "@/types/Vaccination/Vaccination";

const mocks = vi.hoisted(() => ({
  useVaccinationCatalog: vi.fn(),
  createApplicationMutation: {
    mutateAsync: vi.fn(),
    isPending: false,
  },
  updateApplicationMutation: {
    mutateAsync: vi.fn(),
    isPending: false,
  },
  deleteApplicationMutation: {
    mutateAsync: vi.fn(),
    isPending: false,
  },
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

vi.mock("@/hooks/Vaccination/useVaccinationCard", () => ({
  useVaccinationCatalog: mocks.useVaccinationCatalog,
}));

vi.mock("@/hooks/Vaccination/useVaccinationMutations", () => ({
  useVaccinationMutations: () => ({
    createApplicationMutation: mocks.createApplicationMutation,
    updateApplicationMutation: mocks.updateApplicationMutation,
    deleteApplicationMutation: mocks.deleteApplicationMutation,
  }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    showSuccess: mocks.showSuccess,
    showError: mocks.showError,
  }),
}));

const vaccinationCard: VaccinationCard = {
  patientUserId: "patient-uuid",
  generatedAt: "2026-05-13",
  canAddApplications: true,
  counts: {
    applied: 1,
    pending: 0,
    overdue: 1,
    upcoming: 1,
  },
  applications: [],
  items: [
    {
      scheduleRuleId: "rule-applied",
      vaccineId: "vaccine-triple",
      vaccine: {
        id: "vaccine-triple",
        code: "triple_viral",
        name: "Triple viral",
        active: true,
      },
      doseLabel: "1ra dosis",
      recommendedAgeMonths: 12,
      overdueAgeMonths: 13,
      recommendedDate: "2021-01-15",
      overdueDate: "2021-02-15",
      status: "applied",
      application: {
        id: "application-uuid",
        patientUserId: "patient-uuid",
        vaccineId: "vaccine-triple",
        scheduleRuleId: "rule-applied",
        doseLabel: "1ra dosis",
        appliedDate: "2021-01-20",
        observations: "Sin reacciones",
        doctorUserId: "doctor-uuid",
        canEdit: true,
        doctor: {
          id: "doctor-uuid",
          firstName: "Carlos",
          lastName: "Gomez",
        },
      },
    },
    {
      scheduleRuleId: "rule-overdue",
      vaccineId: "vaccine-vph",
      vaccine: {
        id: "vaccine-vph",
        code: "vph",
        name: "VPH",
        active: true,
      },
      doseLabel: "Unica dosis",
      recommendedAgeMonths: 132,
      overdueAgeMonths: 144,
      recommendedDate: "2031-01-15",
      overdueDate: "2032-01-15",
      status: "overdue",
    },
    {
      scheduleRuleId: "rule-upcoming",
      vaccineId: "vaccine-dtpa",
      vaccine: {
        id: "vaccine-dtpa",
        code: "dtpa",
        name: "dTpa",
        active: true,
      },
      doseLabel: "11 anios",
      recommendedAgeMonths: 132,
      overdueAgeMonths: 144,
      recommendedDate: "2031-01-15",
      overdueDate: "2032-01-15",
      status: "upcoming",
    },
  ],
};

describe("VaccinationCardView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useVaccinationCatalog.mockReturnValue({
      catalog: {
        vaccines: [],
        scheduleRules: [],
      },
      isLoading: false,
    });
  });

  it("renders the card in patient read-only mode", () => {
    render(
      <VaccinationCardView
        vaccinationCard={{ ...vaccinationCard, canAddApplications: false }}
      />
    );

    expect(screen.getByText("Carnet de vacunacion")).toBeInTheDocument();
    expect(screen.getByText("Triple viral")).toBeInTheDocument();
    expect(screen.getByText("1ra dosis")).toBeInTheDocument();
    expect(screen.getByText("20/01/2021")).toBeInTheDocument();
    expect(screen.getByText("Carlos Gomez")).toBeInTheDocument();
    expect(screen.getByText("Sin reacciones")).toBeInTheDocument();
    expect(screen.getByText("Aplicada")).toBeInTheDocument();
    expect(screen.queryByText("VPH")).not.toBeInTheDocument();
    expect(screen.queryByText("dTpa")).not.toBeInTheDocument();
    expect(screen.queryByText("Pendientes")).not.toBeInTheDocument();
    expect(screen.queryByText("Vencidas")).not.toBeInTheDocument();
    expect(screen.queryByText("Proximas")).not.toBeInTheDocument();
    expect(screen.queryByText("Vencida")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /cargar vacuna/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /editar triple viral/i })
    ).not.toBeInTheDocument();
    expect(mocks.useVaccinationCatalog).toHaveBeenCalledWith(false);
  });

  it("shows doctor actions when the card allows applications", () => {
    render(<VaccinationCardView vaccinationCard={vaccinationCard} isDoctor />);

    expect(
      screen.getByRole("button", { name: /cargar vacuna/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /editar triple viral 1ra dosis/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /eliminar triple viral 1ra dosis/i })
    ).toBeInTheDocument();
    expect(mocks.useVaccinationCatalog).toHaveBeenCalledWith(true);
  });

  it("shows an empty state when the card has no applied vaccines", () => {
    render(
      <VaccinationCardView
        vaccinationCard={{
          ...vaccinationCard,
          canAddApplications: false,
          items: vaccinationCard.items.filter((item) => !item.application),
        }}
      />
    );

    expect(
      screen.getByText("No hay vacunas aplicadas cargadas")
    ).toBeInTheDocument();
    expect(screen.queryByText("VPH")).not.toBeInTheDocument();
    expect(screen.queryByText("dTpa")).not.toBeInTheDocument();
    expect(screen.queryByText("Vencidas")).not.toBeInTheDocument();
  });
});
