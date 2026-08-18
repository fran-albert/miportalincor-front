// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatusBadge } from "./StatusBadge";
import {
  AppointmentStatus,
  AppointmentStatusColors,
  AppointmentStatusLabels,
} from "@/types/Appointment/Appointment";
import {
  OverturnStatus,
  OverturnStatusColors,
  OverturnStatusLabels,
} from "@/types/Overturn/Overturn";
import {
  PatientAppointmentStatusColors,
  PatientAppointmentStatusLabels,
  PatientOverturnStatusColors,
  PatientOverturnStatusLabels,
} from "@/common/constants/patient-appointment-status";

const appointmentStatuses = Object.values(AppointmentStatus);
const overturnStatuses = Object.values(OverturnStatus);

describe("StatusBadge", () => {
  describe("audiencia staff (default)", () => {
    it.each(appointmentStatuses)(
      "%s renderiza el label interno del backoffice",
      (status) => {
        const { container } = render(<StatusBadge status={status} />);

        expect(screen.getByText(AppointmentStatusLabels[status])).toBeInTheDocument();
        AppointmentStatusColors[status]
          .split(" ")
          .forEach((cls) => expect(container.firstChild).toHaveClass(cls));
      },
    );

    it.each(overturnStatuses)(
      "%s renderiza el label interno del sobreturno",
      (status) => {
        const { container } = render(<StatusBadge status={status} type="overturn" />);

        expect(screen.getByText(OverturnStatusLabels[status])).toBeInTheDocument();
        OverturnStatusColors[status]
          .split(" ")
          .forEach((cls) => expect(container.firstChild).toHaveClass(cls));
      },
    );

    it("pasar audience='staff' explícito da lo mismo que el default", () => {
      const { container: byDefault } = render(
        <StatusBadge status={AppointmentStatus.PENDING} />,
      );
      const { container: explicit } = render(
        <StatusBadge status={AppointmentStatus.PENDING} audience="staff" />,
      );

      expect(explicit.innerHTML).toBe(byDefault.innerHTML);
    });

    it("PENDING sigue diciendo 'Pendiente' en amarillo", () => {
      const { container } = render(<StatusBadge status={AppointmentStatus.PENDING} />);

      expect(screen.getByText("Pendiente")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("bg-yellow-100");
      expect(container.firstChild).toHaveClass("text-yellow-800");
    });
  });

  describe("audiencia paciente", () => {
    it.each(appointmentStatuses)(
      "%s renderiza el label del paciente",
      (status) => {
        const { container } = render(
          <StatusBadge status={status} audience="patient" />,
        );

        expect(
          screen.getByText(PatientAppointmentStatusLabels[status]),
        ).toBeInTheDocument();
        PatientAppointmentStatusColors[status]
          .split(" ")
          .forEach((cls) => expect(container.firstChild).toHaveClass(cls));
      },
    );

    it.each(overturnStatuses)(
      "%s renderiza el label del paciente en sobreturnos",
      (status) => {
        const { container } = render(
          <StatusBadge status={status} type="overturn" audience="patient" />,
        );

        expect(
          screen.getByText(PatientOverturnStatusLabels[status]),
        ).toBeInTheDocument();
        PatientOverturnStatusColors[status]
          .split(" ")
          .forEach((cls) => expect(container.firstChild).toHaveClass(cls));
      },
    );

    it("PENDING dice 'Turno reservado' en verde y nunca 'Pendiente'", () => {
      const { container } = render(
        <StatusBadge status={AppointmentStatus.PENDING} audience="patient" />,
      );

      expect(screen.getByText("Turno reservado")).toBeInTheDocument();
      expect(screen.queryByText(/Pendiente/i)).not.toBeInTheDocument();
      expect(container.textContent).not.toContain("Pendiente");
      expect(container.firstChild).toHaveClass("bg-green-100");
      expect(container.firstChild).toHaveClass("text-green-800");
    });

    it("PENDING de sobreturno dice 'Turno reservado' y nunca 'Pendiente'", () => {
      const { container } = render(
        <StatusBadge
          status={OverturnStatus.PENDING}
          type="overturn"
          audience="patient"
        />,
      );

      expect(screen.getByText("Turno reservado")).toBeInTheDocument();
      expect(container.textContent).not.toContain("Pendiente");
    });
  });
});

describe("no regresión del vocabulario del staff", () => {
  it("AppointmentStatusLabels queda intacto", () => {
    expect(AppointmentStatusLabels[AppointmentStatus.PENDING]).toBe("Pendiente");
    expect(AppointmentStatusLabels[AppointmentStatus.WAITING]).toBe("En espera");
    expect(AppointmentStatusLabels[AppointmentStatus.ATTENDING]).toBe("En atención");
    expect(AppointmentStatusLabels[AppointmentStatus.COMPLETED]).toBe("Completado");
    expect(AppointmentStatusLabels[AppointmentStatus.REQUESTED_BY_PATIENT]).toBe(
      "Solicitado (paciente)",
    );
    expect(AppointmentStatusLabels[AppointmentStatus.ASSIGNED_BY_SECRETARY]).toBe(
      "Asignado (secretaria)",
    );
    expect(AppointmentStatusLabels[AppointmentStatus.CANCELLED_BY_PATIENT]).toBe(
      "Cancelado (paciente)",
    );
    expect(AppointmentStatusLabels[AppointmentStatus.CANCELLED_BY_SECRETARY]).toBe(
      "Cancelado (secretaria)",
    );
  });

  it("AppointmentStatusColors conserva el amarillo de PENDING", () => {
    expect(AppointmentStatusColors[AppointmentStatus.PENDING]).toBe(
      "bg-yellow-100 text-yellow-800",
    );
  });

  it("OverturnStatusLabels y OverturnStatusColors quedan intactos", () => {
    expect(OverturnStatusLabels[OverturnStatus.PENDING]).toBe("Pendiente");
    expect(OverturnStatusColors[OverturnStatus.PENDING]).toBe(
      "bg-yellow-100 text-yellow-800",
    );
  });
});
