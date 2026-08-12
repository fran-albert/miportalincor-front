// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProgramDetailPage from "./Detail";
import EnrollmentDetailPage from "./Enrollment";
import { EnrollmentStatus } from "@/types/Program/ProgramEnrollment";

const mockUseProgram = vi.fn();
const mockUseProgramMembership = vi.fn();
const mockUseEnrollment = vi.fn();
const mockUseMedicalEvaluation = vi.fn();

vi.mock("@/hooks/Program/useProgram", () => ({
  useProgram: () => mockUseProgram(),
}));

vi.mock("@/hooks/Program/useProgramMembership", () => ({
  useProgramMembership: () => mockUseProgramMembership(),
}));

vi.mock("@/hooks/Program/useEnrollment", () => ({
  useEnrollment: () => mockUseEnrollment(),
}));

vi.mock("@/hooks/Program/useProgramActivities", () => ({
  useProgramActivities: () => ({ activities: [] }),
}));

vi.mock("@/hooks/Program/useMedicalEvaluation", () => ({
  useMedicalEvaluation: () => mockUseMedicalEvaluation(),
}));

vi.mock(
  "@/components/Programs/Enrollment/ClinicalIntake/ClinicalIntakeTab",
  () => ({
    default: () => <div>Contenido de la ficha de ingreso</div>,
  })
);

vi.mock("@/components/PageHeader", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock("@/components/Programs/Detail/Enrollments/EnrollmentsTab", () => ({
  default: () => <div>Listado operativo de pacientes</div>,
}));

vi.mock("@/components/Programs/Detail/Activities/ActivitiesTab", () => ({
  default: () => <div>Listado de actividades</div>,
}));

vi.mock("@/components/Programs/Detail/Members/MembersTab", () => ({
  default: () => <div>Listado de miembros</div>,
}));

vi.mock("@/components/Programs/Enrollment/Plan/PlanTab", () => ({
  default: () => <div>Contenido clínico del plan</div>,
}));

vi.mock("@/components/Programs/Enrollment/Attendance/AttendanceTab", () => ({
  default: () => <div>Contenido de asistencias</div>,
}));

vi.mock("@/components/Programs/Enrollment/Compliance/ComplianceTab", () => ({
  default: () => <div>Contenido de cumplimiento</div>,
}));

vi.mock("@/components/Programs/Enrollment/FollowUp/FollowUpTab", () => ({
  default: () => <div>Contenido clínico de seguimiento</div>,
}));

vi.mock("@/components/Programs/Enrollment/MonthlyPricing/MonthlyPricingTab", () => ({
  default: () => <div>Contenido de arancel mensual</div>,
}));

const renderRoute = (path: string, element: React.ReactElement) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/programas/:programId/inscripciones/:enrollmentId"
            element={element}
          />
          <Route path="/programas/:programId" element={element} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

const operatorMembership = {
  isLoading: false,
  isAdmin: false,
  isProgramMember: false,
  isCoordinator: false,
  isProgramOperator: true,
  hasClinicalProgramAccess: false,
  canManageMonthlyPricing: false,
  canRegisterClinicalIntake: false,
};

describe("acceso operativo no clínico a Programas", () => {
  beforeEach(() => {
    mockUseProgram.mockReturnValue({
      program: {
        id: "program-1",
        name: "Programa cardiometabólico",
        description: "Seguimiento integral",
        isActive: true,
      },
      isLoading: false,
    });
    mockUseEnrollment.mockReturnValue({
      enrollment: {
        id: "enrollment-1",
        programId: "program-1",
        patientUserId: "patient-1",
        patientFirstName: "Ana",
        patientLastName: "Pérez",
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: "2026-07-16T12:00:00.000Z",
      },
      isLoading: false,
    });
    mockUseProgramMembership.mockReturnValue(operatorMembership);
    mockUseMedicalEvaluation.mockReturnValue({
      evaluationDetail: undefined,
      evaluation: null,
      completeness: undefined,
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("muestra Pacientes y Actividades a Secretaría, sin Miembros", () => {
    renderRoute("/programas/program-1", <ProgramDetailPage />);

    expect(screen.getByRole("tab", { name: "Pacientes" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Actividades" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Miembros" })).toBeNull();
  });

  it("conserva Miembros para Administrador junto con la operación", () => {
    mockUseProgramMembership.mockReturnValue({
      ...operatorMembership,
      isAdmin: true,
    });

    renderRoute("/programas/program-1", <ProgramDetailPage />);

    expect(screen.getByRole("tab", { name: "Pacientes" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Miembros" })).toBeInTheDocument();
  });

  it("muestra sólo Asistencia y Cumplimiento en la inscripción del operador", () => {
    renderRoute(
      "/programas/program-1/inscripciones/enrollment-1",
      <EnrollmentDetailPage />
    );

    expect(
      screen.getByRole("tab", { name: "Asistencia" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Cumplimiento" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Plan" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Seguimiento" })).toBeNull();
    // El operador que NO es miembro del programa sigue sin ver el arancel.
    expect(screen.queryByRole("tab", { name: "Arancel mensual" })).toBeNull();
    expect(screen.queryByText("Contenido clínico del plan")).toBeNull();
    expect(screen.queryByText("Contenido clínico de seguimiento")).toBeNull();
  });

  it("le muestra Arancel mensual al operador que es miembro del programa", () => {
    // Caso Vanesa (2026-08-02): Administrador + Secretaria y coordinadora del
    // programa. Ya veía Plan/Asistencia/Cumplimiento/Seguimiento por ser
    // miembro, pero NO "Arancel mensual" — aunque el backend la autorizaba
    // (sólo exige rol médico + ser miembro). Lo único que cambia es que ahora
    // la pestaña aparece.
    mockUseProgramMembership.mockReturnValue({
      ...operatorMembership,
      isAdmin: true,
      isProgramMember: true,
      isProgramOperator: true,
      hasClinicalProgramAccess: false,
      canManageMonthlyPricing: true,
    });

    renderRoute(
      "/programas/program-1/inscripciones/enrollment-1",
      <EnrollmentDetailPage />
    );

    expect(
      screen.getByRole("tab", { name: "Arancel mensual" })
    ).toBeInTheDocument();
  });

  it("conserva Plan y Seguimiento y agrega Arancel mensual al miembro clínico", () => {
    mockUseProgramMembership.mockReturnValue({
      ...operatorMembership,
      isProgramMember: true,
      isProgramOperator: false,
      hasClinicalProgramAccess: true,
      canManageMonthlyPricing: true,
    });

    renderRoute(
      "/programas/program-1/inscripciones/enrollment-1",
      <EnrollmentDetailPage />
    );

    expect(screen.getByRole("tab", { name: "Plan" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Seguimiento" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Arancel mensual" })
    ).toBeInTheDocument();
  });

  it("no muestra la pestaña Evaluación en un programa sin ficha clínica", () => {
    mockUseProgramMembership.mockReturnValue({
      ...operatorMembership,
      isProgramMember: true,
      isProgramOperator: false,
      hasClinicalProgramAccess: true,
      canManageMonthlyPricing: true,
    });

    renderRoute(
      "/programas/program-1/inscripciones/enrollment-1",
      <EnrollmentDetailPage />
    );

    expect(screen.queryByRole("tab", { name: "Evaluación" })).toBeNull();
    expect(screen.queryByText("Contenido de la ficha de ingreso")).toBeNull();
  });

  it("muestra Evaluación y las zonas a evitar cuando el programa lleva ficha clínica", () => {
    mockUseProgram.mockReturnValue({
      program: {
        id: "program-dolor",
        name: "Unidad Integral del Dolor",
        isActive: true,
        clinicalIntakeEnabled: true,
      },
      isLoading: false,
    });
    mockUseProgramMembership.mockReturnValue({
      ...operatorMembership,
      isProgramMember: true,
      isProgramOperator: false,
      hasClinicalProgramAccess: true,
      canManageMonthlyPricing: true,
      canRegisterClinicalIntake: true,
    });
    mockUseMedicalEvaluation.mockReturnValue({
      evaluationDetail: undefined,
      evaluation: {
        contraindications: "Evitar impacto y flexión profunda de rodilla",
        diagnosis: "Gonartrosis bilateral",
      },
      completeness: undefined,
      isLoading: false,
    });

    renderRoute(
      "/programas/program-dolor/inscripciones/enrollment-1",
      <EnrollmentDetailPage />
    );

    expect(
      screen.getByRole("tab", { name: "Evaluación" })
    ).toBeInTheDocument();
    // Las zonas a evitar se ven arriba de todo, en cualquier pestaña.
    expect(
      screen.getByText("Zonas a evitar / movimientos contraindicados")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Evitar impacto y flexión profunda de rodilla")
    ).toBeInTheDocument();
  });

  it("no muestra el cartel de zonas a evitar si la ficha no las tiene cargadas", () => {
    mockUseProgram.mockReturnValue({
      program: {
        id: "program-dolor",
        name: "Unidad Integral del Dolor",
        isActive: true,
        clinicalIntakeEnabled: true,
      },
      isLoading: false,
    });
    mockUseProgramMembership.mockReturnValue({
      ...operatorMembership,
      isProgramMember: true,
      isProgramOperator: false,
      hasClinicalProgramAccess: true,
    });

    renderRoute(
      "/programas/program-dolor/inscripciones/enrollment-1",
      <EnrollmentDetailPage />
    );

    expect(
      screen.queryByText("Zonas a evitar / movimientos contraindicados")
    ).toBeNull();
  });
});
