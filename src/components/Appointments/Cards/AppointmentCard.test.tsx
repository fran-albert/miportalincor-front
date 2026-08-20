// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppointmentCard } from "./AppointmentCard";
import {
  AppointmentStatus,
  type AppointmentFullResponseDto,
  type ConsultationTypeBasicDto,
} from "@/types/Appointment/Appointment";

const buildAppointment = (
  consultationTypes: ConsultationTypeBasicDto[],
): AppointmentFullResponseDto =>
  ({
    id: 900,
    doctorId: 388,
    patientId: 5,
    date: "2026-08-20",
    hour: "09:20:00",
    status: AppointmentStatus.PENDING,
    consultationTypes,
    patient: {
      id: 5,
      firstName: "RUBEN",
      lastName: "RISSO",
      userName: "20123456",
    },
    doctor: { id: 388, firstName: "Ana", lastName: "Perez" },
  }) as unknown as AppointmentFullResponseDto;

const ECOCARDIOGRAMA: ConsultationTypeBasicDto = {
  id: 1,
  name: "Ecocardiograma Doppler Color",
};
const ERGOMETRIA: ConsultationTypeBasicDto = { id: 2, name: "Ergometría" };
const DOPPLER_CUELLO: ConsultationTypeBasicDto = {
  id: 3,
  name: "Doppler de Vasos de Cuello",
};

describe("AppointmentCard compacta", () => {
  it("un turno de un solo estudio muestra ese estudio (no-regresión)", () => {
    render(
      <AppointmentCard appointment={buildAppointment([ERGOMETRIA])} compact />,
    );

    expect(screen.getByText("Ergometría")).toBeInTheDocument();
  });

  it("🔴 un turno de dos estudios los nombra a los dos, sin +1", () => {
    render(
      <AppointmentCard
        appointment={buildAppointment([ECOCARDIOGRAMA, ERGOMETRIA])}
        compact
      />,
    );

    expect(screen.getByText("Ecocardiograma Doppler Color")).toBeInTheDocument();
    expect(screen.getByText("Ergometría")).toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("🔴 un turno de tres estudios los nombra a los tres, sin +2", () => {
    render(
      <AppointmentCard
        appointment={buildAppointment([
          ECOCARDIOGRAMA,
          DOPPLER_CUELLO,
          ERGOMETRIA,
        ])}
        compact
      />,
    );

    expect(screen.getByText("Ecocardiograma Doppler Color")).toBeInTheDocument();
    expect(screen.getByText("Doppler de Vasos de Cuello")).toBeInTheDocument();
    expect(screen.getByText("Ergometría")).toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("un turno sin estudios no muestra ningún chip de tipo", () => {
    render(<AppointmentCard appointment={buildAppointment([])} compact />);

    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
    expect(screen.getByText(/RUBEN/)).toBeInTheDocument();
  });
});
