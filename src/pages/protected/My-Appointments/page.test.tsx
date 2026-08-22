// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import MyAppointmentsPage from "./page";
import {
  AppointmentFullResponseDto,
  AppointmentStatus,
} from "@/types/Appointment/Appointment";

const mockUsePatientAppointments = vi.fn();

vi.mock("@/hooks/Appointments", () => ({
  usePatientAppointments: (args: unknown) => mockUsePatientAppointments(args),
  useAppointmentMutations: () => ({
    changeStatus: { mutateAsync: vi.fn() },
    isChangingStatus: false,
  }),
  useReschedulePatientAppointment: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/useRoles", () => ({
  default: () => ({ session: { id: "42" } }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Los diálogos arrastran queries y catálogos: no son el objeto de este test.
vi.mock("@/components/Appointments/RequestAppointmentDialog", () => ({
  RequestAppointmentDialog: () => null,
}));

vi.mock("@/components/Appointments/Dialogs/RescheduleAppointmentDialog", () => ({
  RescheduleAppointmentDialog: () => null,
}));

const daysFromToday = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const buildAppointment = (
  overrides: Partial<AppointmentFullResponseDto> = {},
): AppointmentFullResponseDto =>
  ({
    id: 1,
    doctorId: 388,
    patientId: 42,
    date: daysFromToday(7),
    hour: "10:00:00",
    status: AppointmentStatus.PENDING,
    doctor: {
      id: 388,
      firstName: "VICTORIA",
      lastName: "TUDELA",
      specialities: [{ id: 1, name: "Ginecología" }],
    },
    ...overrides,
  }) as unknown as AppointmentFullResponseDto;

const renderPage = (appointments: AppointmentFullResponseDto[]) => {
  mockUsePatientAppointments.mockReturnValue({
    appointments,
    total: appointments.length,
    isLoading: false,
    isError: false,
  });

  return render(
    <HelmetProvider>
      <MemoryRouter>
        <MyAppointmentsPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
};

const openHistoryTab = () => {
  fireEvent.mouseDown(screen.getByRole("tab", { name: /historial/i }));
  fireEvent.click(screen.getByRole("tab", { name: /historial/i }));
};

describe("MyAppointmentsPage — vocabulario del paciente", () => {
  beforeEach(() => {
    mockUsePatientAppointments.mockReset();
  });

  it("un turno futuro PENDING dice 'Turno reservado', no 'Pendiente'", () => {
    renderPage([buildAppointment()]);

    expect(screen.getByText("Turno reservado")).toBeInTheDocument();
    expect(screen.queryByText("Pendiente")).not.toBeInTheDocument();
  });

  it("un turno futuro PENDING muestra la leyenda que evita el llamado a la clínica", () => {
    renderPage([buildAppointment()]);

    expect(screen.getByText(/No hace falta confirmar/i)).toBeInTheDocument();
    expect(
      screen.getByText("No hace falta confirmar: tu turno ya está reservado."),
    ).toBeInTheDocument();
  });

  it("un turno cancelado no muestra la leyenda y habla en idioma del paciente", () => {
    renderPage([
      buildAppointment({
        id: 2,
        status: AppointmentStatus.CANCELLED_BY_PATIENT,
      }),
    ]);

    openHistoryTab();

    expect(screen.getByText("Cancelado por vos")).toBeInTheDocument();
    expect(screen.queryByText(/No hace falta confirmar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cancelado \(paciente\)/i)).not.toBeInTheDocument();
  });

  it("un turno cancelado por la clínica lo dice con esas palabras", () => {
    renderPage([
      buildAppointment({
        id: 3,
        status: AppointmentStatus.CANCELLED_BY_SECRETARY,
      }),
    ]);

    openHistoryTab();

    expect(screen.getByText("Cancelado por la clínica")).toBeInTheDocument();
    expect(screen.queryByText(/No hace falta confirmar/i)).not.toBeInTheDocument();
  });

  it("un turno ya pasado se muestra como Finalizado y sin leyenda", () => {
    renderPage([buildAppointment({ id: 4, date: daysFromToday(-7) })]);

    openHistoryTab();

    expect(screen.getByText("Finalizado")).toBeInTheDocument();
    expect(screen.queryByText(/No hace falta confirmar/i)).not.toBeInTheDocument();
  });
});

describe("MyAppointmentsPage — un turno con varios estudios", () => {
  beforeEach(() => {
    mockUsePatientAppointments.mockReset();
  });

  it("🔴 un turno de dos estudios los nombra a los dos, sin +1", () => {
    renderPage([
      buildAppointment({
        consultationTypes: [
          { id: 1, name: "Ecocardiograma Doppler Color" },
          { id: 2, name: "Ergometría" },
        ],
      }),
    ]);

    expect(screen.getByText("Ecocardiograma Doppler Color")).toBeInTheDocument();
    expect(screen.getByText("Ergometría")).toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("🔴 dos subtipos de eco son UN solo chip 'Ecografía', no dos repetidos", () => {
    renderPage([
      buildAppointment({
        consultationTypes: [
          { id: 10, name: "Ecografía Mamaria", publicName: "Ecografía" },
          { id: 11, name: "Ecografía Transvaginal", publicName: "Ecografía" },
        ],
      }),
    ]);

    expect(screen.getAllByText("Ecografía")).toHaveLength(1);
  });

  it("🔴 el subtipo real de la eco no se le filtra a la paciente", () => {
    renderPage([
      buildAppointment({
        consultationTypes: [
          { id: 10, name: "Ecografía Mamaria", publicName: "Ecografía" },
          { id: 11, name: "Ecografía Transvaginal", publicName: "Ecografía" },
        ],
      }),
    ]);

    expect(screen.queryByText(/Mamaria/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Transvaginal/i)).not.toBeInTheDocument();
  });

  it("un turno de un solo estudio se ve igual que hoy", () => {
    renderPage([
      buildAppointment({
        consultationTypes: [{ id: 2, name: "Ergometría" }],
      }),
    ]);

    expect(screen.getAllByText("Ergometría")).toHaveLength(1);
  });
});
