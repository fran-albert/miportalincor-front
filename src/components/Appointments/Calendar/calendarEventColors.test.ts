import { describe, expect, it } from "vitest";
import {
  formatIntegralCheckupDayBadge,
  resolveCalendarEventBaseColors,
  summarizeIntegralCheckupsByDay,
} from "./calendarEventColors";
import { getSpecialConsultationTypeInfo } from "@/common/helpers/special-consultation-types";
import { AppointmentStatus, IntegralCheckupLink } from "@/types/Appointment/Appointment";
import { OverturnStatus } from "@/types/Overturn/Overturn";

/**
 * El sobreturno con estudio especial se pinta como el turno de ese estudio:
 * la directora lo pidió porque el MAPA casi siempre se da como sobreturno.
 * El sobreturno sin tipo especial sigue en su naranja de siempre.
 */
const OVERTURN_ORANGE = {
  backgroundColor: "#feefc3",
  textColor: "#9a3412",
  borderColor: "#f59e0b",
};

describe("resolveCalendarEventBaseColors", () => {
  it("pinta un sobreturno MAPA con el color del MAPA", () => {
    const mapa = getSpecialConsultationTypeInfo("MAPA");
    expect(mapa).not.toBeNull();

    expect(
      resolveCalendarEventBaseColors({
        isOverturn: true,
        status: OverturnStatus.PENDING,
        specialConsultationType: mapa,
      }),
    ).toEqual({
      backgroundColor: mapa!.eventBackgroundColor,
      textColor: mapa!.eventTextColor,
      borderColor: mapa!.eventBorderColor,
    });
  });

  it("pinta un sobreturno AMPA con el color del AMPA", () => {
    const ampa = getSpecialConsultationTypeInfo("AMPA");
    expect(ampa).not.toBeNull();

    expect(
      resolveCalendarEventBaseColors({
        isOverturn: true,
        status: OverturnStatus.WAITING,
        specialConsultationType: ampa,
      }),
    ).toEqual({
      backgroundColor: ampa!.eventBackgroundColor,
      textColor: ampa!.eventTextColor,
      borderColor: ampa!.eventBorderColor,
    });
  });

  it("deja en naranja un sobreturno sin tipo", () => {
    expect(
      resolveCalendarEventBaseColors({
        isOverturn: true,
        status: OverturnStatus.PENDING,
        specialConsultationType: getSpecialConsultationTypeInfo(undefined),
      }),
    ).toEqual(OVERTURN_ORANGE);
  });

  it("deja en naranja un sobreturno con un tipo que no es especial", () => {
    expect(
      resolveCalendarEventBaseColors({
        isOverturn: true,
        status: OverturnStatus.PENDING,
        specialConsultationType: getSpecialConsultationTypeInfo("Consulta"),
      }),
    ).toEqual(OVERTURN_ORANGE);
  });

  it("un sobreturno cancelado no toma el color del estudio", () => {
    expect(
      resolveCalendarEventBaseColors({
        isOverturn: true,
        status: OverturnStatus.CANCELLED_BY_SECRETARY,
        specialConsultationType: getSpecialConsultationTypeInfo("MAPA"),
      }),
    ).toEqual(OVERTURN_ORANGE);
  });

  it("los turnos siguen igual: color por estado y el del estudio si es especial", () => {
    expect(
      resolveCalendarEventBaseColors({
        isOverturn: false,
        status: AppointmentStatus.WAITING,
        specialConsultationType: null,
      }),
    ).toEqual({ backgroundColor: "#d9f2e3", textColor: "#166534", borderColor: "#34a853" });

    expect(
      resolveCalendarEventBaseColors({
        isOverturn: false,
        status: AppointmentStatus.CANCELLED_BY_PATIENT,
        specialConsultationType: null,
      }),
    ).toEqual({ backgroundColor: "#fee2e2", textColor: "#b91c1c", borderColor: "#f87171" });

    const holter = getSpecialConsultationTypeInfo("Holter 24 hs");
    expect(
      resolveCalendarEventBaseColors({
        isOverturn: false,
        status: AppointmentStatus.PENDING,
        specialConsultationType: holter,
      }).backgroundColor,
    ).toBe(holter!.eventBackgroundColor);
  });
});

/**
 * La directora quiere ver en la vista de mes qué días tienen control
 * ginecológico integral sin abrir cada día: la marca tiene que salir aunque
 * el turno quede escondido detrás de "+N más".
 */
describe("summarizeIntegralCheckupsByDay", () => {
  const link = (color?: string): IntegralCheckupLink => ({
    role: "CONSULTATION",
    counterpartType: "OVERTURN",
    counterpartId: 1,
    counterpartDoctorId: 2,
    counterpartDate: "2027-01-13",
    counterpartHour: "08:45",
    counterpartDescription: "Ecografía ginecológica y mamaria",
    color,
  });

  const at = (date: string, hour: string) => new Date(`${date}T${hour}:00`);

  it("cuenta turnos y sobreturnos integrales del mismo día", () => {
    const summary = summarizeIntegralCheckupsByDay([
      {
        start: at("2027-01-13", "09:00"),
        resource: {
          type: "appointment",
          status: AppointmentStatus.PENDING,
          integralCheckup: link("#D946EF"),
        },
      },
      {
        start: at("2027-01-13", "08:45"),
        resource: {
          type: "overturn",
          status: OverturnStatus.PENDING,
          integralCheckup: link(),
        },
      },
    ]);

    expect(summary.get("2027-01-13")).toEqual({ count: 2, color: "#D946EF" });
  });

  it("no cuenta los integrales cancelados", () => {
    const summary = summarizeIntegralCheckupsByDay([
      {
        start: at("2027-01-13", "09:00"),
        resource: {
          type: "appointment",
          status: AppointmentStatus.CANCELLED_BY_PATIENT,
          integralCheckup: link(),
        },
      },
      {
        start: at("2027-01-13", "08:45"),
        resource: {
          type: "overturn",
          status: OverturnStatus.CANCELLED_BY_SECRETARY,
          integralCheckup: link(),
        },
      },
    ]);

    expect(summary.has("2027-01-13")).toBe(false);
  });

  it("no marca turnos comunes ni otros días", () => {
    const summary = summarizeIntegralCheckupsByDay([
      {
        start: at("2026-12-30", "10:00"),
        resource: {
          type: "appointment",
          status: AppointmentStatus.PENDING,
          integralCheckup: link(),
        },
      },
      {
        start: at("2027-01-13", "10:00"),
        resource: { type: "appointment", status: AppointmentStatus.PENDING, integralCheckup: null },
      },
      {
        start: at("2027-01-14", "10:00"),
        resource: { type: "overturn", status: OverturnStatus.PENDING },
      },
      {
        start: at("2027-01-15", "10:00"),
        resource: { type: "available", integralCheckup: link() },
      },
    ]);

    expect([...summary.keys()]).toEqual(["2026-12-30"]);
    expect(summary.get("2026-12-30")).toEqual({ count: 1, color: null });
  });
});

describe("formatIntegralCheckupDayBadge", () => {
  it("dice Integral si hay uno y suma la cantidad si hay más", () => {
    expect(formatIntegralCheckupDayBadge(1)).toBe("Integral");
    expect(formatIntegralCheckupDayBadge(3)).toBe("Integral ×3");
  });
});
