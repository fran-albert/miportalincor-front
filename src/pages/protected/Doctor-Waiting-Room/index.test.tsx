// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import DoctorWaitingRoomPage from "./index";
import {
  AppointmentStatus,
  type AppointmentFullResponseDto,
  type ConsultationTypeBasicDto,
} from "@/types/Appointment/Appointment";
import type { AgendaItem } from "@/hooks/Doctor/useDoctorDayAgenda";
import type { QueueEntry } from "@/types/Queue";

const mockAgenda = vi.fn();
const mockWaitingQueue = vi.fn();

vi.mock("@/hooks/Doctor/useDoctorDayAgenda", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/hooks/Doctor/useDoctorDayAgenda")>();
  return {
    ...actual,
    useDoctorDayAgenda: () => mockAgenda(),
  };
});

vi.mock("@/hooks/Doctor/useDoctorWaitingQueue", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/hooks/Doctor/useDoctorWaitingQueue")
    >();
  return {
    ...actual,
    useDoctorWaitingQueue: () => mockWaitingQueue(),
  };
});

vi.mock("@/hooks/Doctor/useDoctorWorkingToday", () => ({
  useDoctorWorkingToday: () => ({
    shouldRestrictWaitingRoom: false,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/Doctor/useDoctorWaitingRoomHistory", () => ({
  doctorWaitingRoomHistoryKeys: { all: ["doctorWaitingRoomHistory"] },
  useDoctorWaitingRoomHistory: () => ({
    agenda: [],
    response: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
  }),
}));

vi.mock("@/hooks/Queue/useDoctorQueue", () => ({
  doctorQueueKeys: { all: ["doctorQueue"] },
  useDoctorMarkAsAttending: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/Appointments/useAppointmentMutations", () => ({
  useAppointmentMutations: () => ({
    changeStatus: { mutate: vi.fn() },
    isChangingStatus: false,
  }),
}));

vi.mock("@/hooks/Overturns/useOverturnMutations", () => ({
  useOverturnMutations: () => ({
    changeStatus: { mutate: vi.fn() },
    isChangingStatus: false,
  }),
}));

vi.mock("@/hooks/Appointments", () => ({
  useSetIntegralUltrasoundTypes: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

// El diálogo del subtipo de eco arrastra el catálogo: no es el objeto de este test.
vi.mock("@/components/Queue/EcoSubtypeDialog", () => ({
  EcoSubtypeDialog: () => null,
}));

const type = (id: number, name: string): ConsultationTypeBasicDto => ({
  id,
  name,
});

const ECOCARDIOGRAMA = type(1, "Ecocardiograma Doppler Color");
const ERGOMETRIA = type(2, "Ergometría");
const DOPPLER_CUELLO = type(3, "Doppler de Vasos de Cuello");
const ELECTROCARDIOGRAMA = type(4, "Electrocardiograma");

const patient = {
  id: 5,
  userId: 5,
  firstName: "RUBEN",
  lastName: "RISSO",
  userName: "20123456",
};

const agendaItem = (
  overrides: Partial<AgendaItem>,
  consultationTypes: ConsultationTypeBasicDto[],
): AgendaItem =>
  ({
    id: 900,
    type: "appointment",
    hour: "09:20",
    date: "2026-08-20",
    status: AppointmentStatus.COMPLETED,
    patient,
    integralCheckup: null,
    rawData: {
      id: 900,
      consultationTypes,
    } as unknown as AppointmentFullResponseDto,
    ...overrides,
  }) as AgendaItem;

const queueEntry = (overrides: Partial<QueueEntry>): QueueEntry =>
  ({
    id: 1,
    appointmentId: 900,
    appointmentType: "SCHEDULED_APPOINTMENT",
    patientId: 5,
    patientName: "RISSO, RUBEN",
    patientDocument: "20123456",
    isGuest: false,
    doctorId: 388,
    doctorName: "Dr. Perez",
    scheduledTime: "10:40",
    status: "WAITING",
    displayNumber: "A-01",
    queueNumber: 1,
    queuePrefix: "A",
    checkedInAt: "2026-08-20T13:30:00.000Z",
    ...overrides,
  }) as QueueEntry;

const renderPage = ({
  agenda = [] as AgendaItem[],
  waitingQueue = [] as QueueEntry[],
} = {}) => {
  mockAgenda.mockReturnValue({
    agenda,
    stats: { completed: 0, total: agenda.length },
    isLoading: false,
    isFetching: false,
  });
  mockWaitingQueue.mockReturnValue({
    waitingQueue,
    isLoading: false,
    isFetching: false,
  });

  return render(
    <HelmetProvider>
      <MemoryRouter>
        <DoctorWaitingRoomPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
};

const openHistory = () => {
  fireEvent.click(screen.getByText(/^Historial \(/));
};

describe("Mi Sala de Espera — un turno dice qué estudios trae", () => {
  beforeEach(() => {
    mockAgenda.mockReset();
    mockWaitingQueue.mockReset();
  });

  it("🔴 la cola usa el array plural del backend, no el nombre singular", () => {
    renderPage({
      waitingQueue: [
        queueEntry({
          consultationTypeName: "Ecocardiograma Doppler Color",
          consultationTypeNames: [
            "Ecocardiograma Doppler Color",
            "Ergometría",
          ],
        }),
      ],
    });

    expect(screen.getByText("Ecocardiograma Doppler Color")).toBeInTheDocument();
    expect(screen.getByText("Ergometría")).toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("una entrada de cola de un solo estudio se ve igual que hoy", () => {
    renderPage({
      waitingQueue: [
        queueEntry({
          consultationTypeName: "Ergometría",
          consultationTypeNames: ["Ergometría"],
        }),
      ],
    });

    expect(screen.getByText("Ergometría")).toBeInTheDocument();
  });

  it("🔴 el paciente en atención muestra sus dos estudios", () => {
    renderPage({
      agenda: [
        agendaItem({ status: AppointmentStatus.ATTENDING }, [
          ECOCARDIOGRAMA,
          ERGOMETRIA,
        ]),
      ],
    });

    expect(screen.getByText("Ecocardiograma Doppler Color")).toBeInTheDocument();
    expect(screen.getByText("Ergometría")).toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("🔴 el historial nombra los cuatro estudios del turno de cuatro", () => {
    renderPage({
      agenda: [
        agendaItem({}, [
          ECOCARDIOGRAMA,
          DOPPLER_CUELLO,
          ELECTROCARDIOGRAMA,
          ERGOMETRIA,
        ]),
      ],
    });

    openHistory();
    const row = screen.getByRole("row", { name: /RISSO, RUBEN/ });

    expect(
      within(row).getByText("Ecocardiograma Doppler Color"),
    ).toBeInTheDocument();
    expect(within(row).getByText("Doppler de Vasos de Cuello")).toBeInTheDocument();
    expect(within(row).getByText("Electrocardiograma")).toBeInTheDocument();
    expect(within(row).getByText("Ergometría")).toBeInTheDocument();
    expect(within(row).queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("🔴 en el historial cada chip lleva el nombre completo para el hover", () => {
    renderPage({
      agenda: [agendaItem({}, [ECOCARDIOGRAMA, ERGOMETRIA])],
    });

    openHistory();
    const row = screen.getByRole("row", { name: /RISSO, RUBEN/ });

    expect(within(row).getByText("Ecocardiograma Doppler Color")).toHaveAttribute(
      "title",
      "Ecocardiograma Doppler Color",
    );
  });

  it("un turno del historial de un solo estudio se ve igual que hoy", () => {
    renderPage({ agenda: [agendaItem({}, [ERGOMETRIA])] });

    openHistory();
    const row = screen.getByRole("row", { name: /RISSO, RUBEN/ });

    expect(within(row).getByText("Ergometría")).toBeInTheDocument();
  });

  it("un turno del historial sin estudios sigue mostrando el guion", () => {
    renderPage({ agenda: [agendaItem({}, [])] });

    openHistory();
    const row = screen.getByRole("row", { name: /RISSO, RUBEN/ });

    expect(within(row).getByText("—")).toBeInTheDocument();
  });
});
