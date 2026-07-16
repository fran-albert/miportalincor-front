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
    expect(screen.queryByText("Contenido clínico del plan")).toBeNull();
    expect(screen.queryByText("Contenido clínico de seguimiento")).toBeNull();
  });

  it("conserva Plan y Seguimiento para un miembro clínico", () => {
    mockUseProgramMembership.mockReturnValue({
      ...operatorMembership,
      isProgramMember: true,
      isProgramOperator: false,
      hasClinicalProgramAccess: true,
    });

    renderRoute(
      "/programas/program-1/inscripciones/enrollment-1",
      <EnrollmentDetailPage />
    );

    expect(screen.getByRole("tab", { name: "Plan" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Seguimiento" })
    ).toBeInTheDocument();
  });
});
