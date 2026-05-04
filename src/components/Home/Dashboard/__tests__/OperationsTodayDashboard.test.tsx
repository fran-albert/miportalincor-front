// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { OperationsTodayDashboardContent } from "../OperationsTodayDashboard";
import type { OperationsTodayDashboard } from "@/types/Operations/TodayDashboard";

vi.mock("@/hooks/Operations/useOperationsTodayDashboard", () => ({
  useOperationsTodayDashboard: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

const dashboard: OperationsTodayDashboard = {
  date: "2026-05-04",
  generatedAt: "2026-05-04T13:30:00.000Z",
  summary: {
    appointments: 3,
    overturns: 1,
    totalEvents: 4,
    workingDoctors: 2,
    waiting: 1,
    called: 0,
    attending: 1,
    completed: 2,
    noShow: 0,
  },
  nextEvents: [
    {
      type: "appointment",
      id: 10,
      doctorId: 7,
      doctorName: "Lopez, Ana",
      patientName: "Perez, Juan",
      hour: "11:00",
      status: "WAITING",
      isGuest: false,
      consultationTypeNames: ["Control"],
    },
    {
      type: "overturn",
      id: 20,
      doctorId: 8,
      doctorName: "Sosa, Pedro",
      patientName: "Rios, Lucia",
      hour: "11:30",
      status: "PENDING",
      isGuest: true,
    },
  ],
  doctors: [
    {
      doctorId: 7,
      doctorName: "Lopez, Ana",
      specialities: ["Cardiologia"],
      isWorkingToday: true,
      startTime: "08:00",
      endTime: "14:00",
      appointments: 3,
      overturns: 0,
      waiting: 1,
      called: 0,
      attending: 1,
      completed: 2,
      noShow: 0,
      status: "working",
    },
  ],
};

describe("OperationsTodayDashboardContent", () => {
  it("renders operational metrics, next events and working doctors", () => {
    render(
      <MemoryRouter>
        <OperationsTodayDashboardContent
          dashboard={dashboard}
          onRefresh={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Operación de hoy")).toBeInTheDocument();
    expect(screen.getAllByText("Turnos").length).toBeGreaterThan(0);
    expect(screen.getByText("Sobreturnos")).toBeInTheDocument();
    expect(screen.getByText("Perez, Juan")).toBeInTheDocument();
    expect(screen.getByText("Rios, Lucia")).toBeInTheDocument();
    expect(screen.getByText("Lopez, Ana")).toBeInTheDocument();
    expect(screen.getByText("Trabaja hoy")).toBeInTheDocument();
    expect(screen.getByText("Sobreturno")).toBeInTheDocument();
  });

  it("shows an error state when the dashboard request fails", () => {
    render(
      <MemoryRouter>
        <OperationsTodayDashboardContent isError />
      </MemoryRouter>
    );

    expect(
      screen.getByText("No se pudo cargar el panel operativo.")
    ).toBeInTheDocument();
  });
});
