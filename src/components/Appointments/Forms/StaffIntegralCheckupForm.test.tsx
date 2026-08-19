import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StaffIntegralCheckupForm } from "./StaffIntegralCheckupForm";
import type { IntegralCheckupSlot } from "@/types/Appointment/Appointment";

/**
 * Lo que la secretaria ve antes de confirmar el control.
 *
 * 🔴 La invariante que estos tests protegen: **el front no calcula ni cablea
 * las horas**. Las dos patas salen tal cual del backend, ya resueltas al modo
 * activo del switch, y la pantalla las ordena por hora. Cuando el circuito se
 * invierta del lado del servidor —ya pasó una vez—, esta pantalla tiene que
 * seguirlo sin tocarle una línea. Por eso el mismo test corre con los dos
 * juegos de horas y en ninguno hay una bandera de modo.
 */

const VIEJO: IntegralCheckupSlot = {
  date: "2027-03-10",
  consultationHour: "10:20",
  ultrasoundHour: "10:05",
  consultationDoctorId: 388,
  ultrasoundDoctorId: 176,
  ultrasoundLabel: "Ecografía Ginecológica, Ecografía Mamaria",
};

const NUEVO: IntegralCheckupSlot = {
  date: "2027-03-10",
  consultationHour: "10:20",
  ultrasoundHour: "10:40",
  consultationDoctorId: 388,
  ultrasoundDoctorId: 176,
  ultrasoundPublicLabel: "Ecografía",
  ultrasoundLabel: "Ecografía",
};

const days = vi.fn<() => IntegralCheckupSlot[]>(() => [NUEVO]);

vi.mock("@/hooks/Appointments", () => ({
  useStaffIntegralAvailableDays: () => ({
    days: days(),
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/hooks/Doctor/useDoctors", () => ({
  useDoctors: () => ({
    doctors: [
      { userId: 388, firstName: "Victoria", lastName: "Tudela", gender: "Femenino" },
      { userId: 176, firstName: "Andrea", lastName: "Torri", gender: "Femenino" },
    ],
    isLoading: false,
  }),
}));

/**
 * El buscador de padrón es el que ya usa el alta común y tiene sus propios
 * tests: acá se reemplaza por un botón que elige una paciente, para que el
 * test hable de lo que este formulario agrega.
 */
vi.mock("../Select/PatientSelectWithGuestOption", () => ({
  PatientSelectWithGuestOption: ({
    onValueChange,
  }: {
    onValueChange: (patientId: number) => void;
  }) => (
    <button type="button" onClick={() => onValueChange(501)}>
      Elegir paciente del padrón
    </button>
  ),
}));

describe("StaffIntegralCheckupForm", () => {
  beforeEach(() => {
    days.mockReturnValue([NUEVO]);
  });

  const renderForm = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
    render(<StaffIntegralCheckupForm onSubmit={onSubmit} />);
    return onSubmit;
  };

  const elegirDiaYPaciente = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByText("Elegir paciente del padrón"));
    await user.click(screen.getByRole("button", { name: /10 de marzo/i }));
    return user;
  };

  it("muestra las dos patas resueltas, con hora y médica de cada una", async () => {
    renderForm();
    await elegirDiaYPaciente();

    const resumen = await screen.findByRole("list", {
      name: /así queda el control/i,
    });
    const momentos = screen.getAllByRole("listitem");

    expect(resumen).toBeInTheDocument();
    expect(momentos).toHaveLength(2);
    expect(momentos[0]).toHaveTextContent("10:20");
    expect(momentos[0]).toHaveTextContent("Tudela");
    expect(momentos[1]).toHaveTextContent("10:40");
    expect(momentos[1]).toHaveTextContent("Torri");
  });

  it("si el backend invierte el orden, la pantalla lo sigue", async () => {
    // Exactamente el mismo componente, el mismo recorrido: lo único que cambia
    // es lo que manda el servidor.
    days.mockReturnValue([VIEJO]);
    renderForm();
    await elegirDiaYPaciente();

    const momentos = await screen.findAllByRole("listitem");

    expect(momentos[0]).toHaveTextContent("10:05");
    expect(momentos[0]).toHaveTextContent("Torri");
    expect(momentos[1]).toHaveTextContent("10:20");
    expect(momentos[1]).toHaveTextContent("Tudela");
  });

  it("le muestra el nombre REAL de la eco, no el público", async () => {
    days.mockReturnValue([VIEJO]);
    renderForm();
    await elegirDiaYPaciente();

    expect(
      await screen.findByText(/Ecografía Ginecológica, Ecografía Mamaria/),
    ).toBeInTheDocument();
  });

  it("al confirmar manda la paciente y el día, nunca las horas", async () => {
    const onSubmit = renderForm();
    const user = await elegirDiaYPaciente();

    await user.click(screen.getByRole("button", { name: /dar el control/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        patientId: 501,
        date: "2027-03-10",
      });
    });
  });

  it("no deja confirmar sin paciente", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /10 de marzo/i }));

    expect(
      screen.getByRole("button", { name: /dar el control/i }),
    ).toBeDisabled();
  });

  it("no deja confirmar sin día", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByText("Elegir paciente del padrón"));

    expect(
      screen.getByRole("button", { name: /dar el control/i }),
    ).toBeDisabled();
  });
});
