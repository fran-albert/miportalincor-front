// @vitest-environment jsdom
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import preOccupationalReducer from "@/store/Pre-Occupational/preOccupationalSlice";
import type { Collaborator } from "@/types/Collaborator/Collaborator";
import type { MedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";
import type { MedicalEvaluationMaintenanceState } from "@/types/Medical-Evaluation/MedicalEvaluationMaintenance";

const mockNavigate = vi.fn();
const mockPromiseToast = vi.fn((promise: Promise<unknown>) => promise);
const mockGetMaintenanceState = vi.fn();
const mockUpdateMedicalEvaluation = vi.fn();
const mockDeleteMedicalEvaluation = vi.fn();
const emptyUrls: [] = [];
const emptyDataValues: [] = [];
const emptyFields: [] = [];

let mockDoctorState: {
  data?: { fullName: string };
  isError?: boolean;
  isLoading?: boolean;
} = {
  data: { fullName: "Dra. Ana Torres" },
  isError: false,
  isLoading: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useBlocker: () => ({
      state: "unblocked",
      reset: vi.fn(),
      proceed: vi.fn(),
    }),
    useBeforeUnload: vi.fn(),
  };
});

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    promiseToast: mockPromiseToast,
  }),
}));

vi.mock("@/api/Medical-Evaluation/get-maintenance-state.medical.evaluation", () => ({
  getMedicalEvaluationMaintenanceState: (...args: unknown[]) =>
    mockGetMaintenanceState(...args),
}));

vi.mock("@/api/Medical-Evaluation/update.medical.evaluation", () => ({
  updateMedicalEvaluation: (...args: unknown[]) => mockUpdateMedicalEvaluation(...args),
}));

vi.mock("@/api/Medical-Evaluation/delete.medical.evaluation", () => ({
  deleteMedicalEvaluation: (...args: unknown[]) => mockDeleteMedicalEvaluation(...args),
}));

vi.mock("@/hooks/Study/useGetAllUrlsByCollaboratorAndMedicalEvaluation", () => ({
  useGetAllUrlsByCollaboratorAndMedicalEvaluation: () => ({
    data: emptyUrls,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/hooks/Data-Values/useDataValues", () => ({
  useDataValuesByMedicalEvaluationId: () => ({
    data: emptyDataValues,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/hooks/Data-Type/useDataTypes", () => ({
  useDataTypes: () => ({
    data: emptyFields,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/Doctor/useDoctorWithSignatures", () => ({
  useDoctorWithSignatures: () => mockDoctorState,
}));

vi.mock("@/hooks/Medical-Evaluation-Report-Version/useCurrentMedicalEvaluationReport", () => ({
  useCurrentMedicalEvaluationReport: () => ({
    currentVersion: null,
    hasLegacyCurrentReport: false,
    hasReport: false,
  }),
}));

vi.mock("@/components/Loading/loading", () => ({
  default: () => <div>Cargando...</div>,
}));

vi.mock("@/components/Pre-Occupational/Collaborator-Information", () => ({
  default: () => <div data-testid="collaborator-information-card" />,
}));

vi.mock("@/components/Tabs/Pre-Occupational/General", () => ({
  default: () => <div data-testid="general-tab" />,
}));

vi.mock("@/components/Tabs/Pre-Occupational/Medical-History", () => ({
  default: () => <div data-testid="medical-history-tab" />,
}));

vi.mock("@/components/Tabs/Pre-Occupational/Various", () => ({
  default: () => <div data-testid="various-tab" />,
}));

vi.mock("@/components/Pre-Occupational/Report-Versioning", () => ({
  default: () => <div data-testid="report-versioning-card" />,
}));

vi.mock("@/components/Pre-Occupational/Report-Versioning/report-status", () => ({
  ReportStatusBadge: () => <span>Sin informe</span>,
}));

vi.mock("@/components/Select/Doctor/select", async () => {
  const ReactModule = await import("react");
  const { Controller } = await import("react-hook-form");

  return {
    DoctorSelect: ({
      control,
      name = "DoctorId",
    }: {
      control: unknown;
      name?: string;
    }) =>
      ReactModule.createElement(Controller, {
        name,
        control,
        render: ({ field }: { field: { value: string; onChange: (value: string) => void } }) =>
          ReactModule.createElement(
            "select",
            {
              "data-testid": "doctor-select",
              value: field.value || "",
              onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
                field.onChange(event.target.value),
            },
            [
              ReactModule.createElement("option", { key: "empty", value: "" }, "Seleccione"),
              ReactModule.createElement("option", { key: "101", value: "101" }, "Dra. Ana Torres"),
              ReactModule.createElement("option", { key: "202", value: "202" }, "Dr. Bruno Díaz"),
            ]
          ),
      }),
  };
});

import PreOccupationalCards from "../Card";

const collaborator: Collaborator = {
  id: 1,
  createdAt: "2026-03-24T10:00:00.000Z",
  updatedAt: "2026-03-24T10:00:00.000Z",
  deletedAt: "",
  firstName: "Francisco",
  lastName: "Albert",
  email: "fran@test.com",
  slug: "francisco-albert",
  birthDate: "1990-01-01",
  phone: "3411111111",
  userName: "30111222",
  gender: "Masculino",
  photoUrl: "",
  company: {
    id: 1,
    createdAt: "2026-03-24T10:00:00.000Z",
    updatedAt: "2026-03-24T10:00:00.000Z",
    deletedAt: "",
    bussinesName: "Incor",
    fantasyName: "Incor",
    cuit: "20-00000000-0",
    email: "empresa@test.com",
    phoneNumber: "3410000000",
    addressId: 1,
  },
  positionJob: "Administración",
} as Collaborator;

const medicalEvaluation: MedicalEvaluation = {
  id: 8,
  createdAt: "2026-03-24T10:00:00.000Z",
  updatedAt: "2026-03-24T10:00:00.000Z",
  deletedAt: "",
  collaborator,
  completed: false,
  doctorId: 80,
  evaluationType: {
    id: 3,
    createdAt: "2026-03-24T10:00:00.000Z",
    updatedAt: "2026-03-24T10:00:00.000Z",
    deletedAt: "",
    name: "Preocupacional",
  },
  dataValues: [],
};

const maintenanceState: MedicalEvaluationMaintenanceState = {
  medicalEvaluationId: 8,
  doctorId: 80,
  completed: false,
  hasStudies: false,
  hasClinicalData: true,
  canDelete: true,
  deleteReasons: [],
};

function renderComponent(
  stateOverride?: MedicalEvaluationMaintenanceState,
  medicalEvaluationOverride?: Partial<MedicalEvaluation>
) {
  mockGetMaintenanceState.mockResolvedValue(stateOverride ?? maintenanceState);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const store = configureStore({
    reducer: {
      preOccupational: preOccupationalReducer,
    },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PreOccupationalCards
          slug="francisco-albert"
          collaborator={collaborator}
          medicalEvaluation={{
            ...medicalEvaluation,
            ...medicalEvaluationOverride,
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}

describe("PreOccupationalCards maintenance flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoctorState = {
      data: { fullName: "Dra. Ana Torres" },
      isError: false,
      isLoading: false,
    };
    mockUpdateMedicalEvaluation.mockResolvedValue({});
    mockDeleteMedicalEvaluation.mockResolvedValue(undefined);
  });

  it("shows invalid doctor state when doctor lookup fails", async () => {
    mockDoctorState = {
      data: undefined,
      isError: true,
      isLoading: false,
    };

    renderComponent();

    expect(await screen.findByText("Médico no válido para firma")).toBeInTheDocument();
    expect(
      screen.getByText("doctorId 80 no resuelve en Historia Clínica")
    ).toBeInTheDocument();
  });

  it("shows missing doctor state when the exam has no assigned doctor", async () => {
    renderComponent(
      {
        ...maintenanceState,
        doctorId: null,
      },
      {
        doctorId: 0,
      }
    );

    expect(await screen.findByText("Sin médico asignado")).toBeInTheDocument();
  });

  it("updates the exam doctor from the maintenance dialog", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: /Corregir médico/i }));

    const select = await screen.findByTestId("doctor-select");
    await user.selectOptions(select, "101");
    await user.click(screen.getByRole("button", { name: /Guardar médico/i }));

    await waitFor(() => {
      expect(mockUpdateMedicalEvaluation).toHaveBeenCalledWith(8, {
        doctorId: 101,
      });
    });
  });

  it("shows delete blockers and disables delete when backend forbids it", async () => {
    const user = userEvent.setup();
    renderComponent({
      ...maintenanceState,
      completed: true,
      hasStudies: true,
      canDelete: false,
      deleteReasons: [
        "El examen ya está marcado como completado y no se puede eliminar.",
        "El examen ya tiene estudios o informes asociados y no se puede eliminar.",
      ],
    });

    await user.click(screen.getByRole("button", { name: /Eliminar examen/i }));

    expect(
      await screen.findByText("No se puede eliminar este examen")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/está marcado como completado/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/estudios o informes asociados/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Eliminar examen$/i })
    ).toBeDisabled();
  });

  it("deletes the exam and navigates back to the exams list when allowed", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: /Eliminar examen/i }));
    const confirmDeleteButton = await screen.findByRole("button", {
      name: /^Eliminar examen$/i,
    });
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockDeleteMedicalEvaluation).toHaveBeenCalledWith(8);
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/incor-laboral/colaboradores/francisco-albert/examenes"
      );
    });
  });
});
