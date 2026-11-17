import { describe, expect, it } from "vitest";
import { resolveCalendarEventBaseColors } from "./calendarEventColors";
import { getSpecialConsultationTypeInfo } from "@/common/helpers/special-consultation-types";
import { AppointmentStatus } from "@/types/Appointment/Appointment";
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
