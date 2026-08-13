import { describe, expect, it } from "vitest";
import {
  integralDaySummary,
  integralMomentsInOrder,
  integralOrderHint,
} from "./integral-checkup-moments";

/**
 * El orden de los dos momentos del control es lo único que cambió entre el
 * circuito viejo y el nuevo, y es exactamente lo que el front no puede
 * cablear. Estos tests corren los dos casos con los horarios reales de la
 * grilla de Incor.
 *
 *   viejo → eco 10:05, consulta 10:20   (la eco iba primero)
 *   nuevo → consulta 10:20, eco 10:40   (la consulta va primera)
 *
 * 🔴 Lo que distingue un caso del otro es SOLO el dato que manda el backend:
 * las horas y, cuando corresponde, el nombre público de la eco. En ningún test
 * hay una bandera de modo, porque el componente tampoco la tiene.
 */
const VIEJO = { consultationHour: "10:20", ultrasoundHour: "10:05" };
const NUEVO = {
  consultationHour: "10:20",
  ultrasoundHour: "10:40",
  ultrasoundPublicLabel: "Ecografía",
};
/** El otro día de la grilla nueva, con 30' de consulta en vez de 20'. */
const NUEVO_JUEVES = {
  consultationHour: "15:00",
  ultrasoundHour: "15:30",
  ultrasoundPublicLabel: "Ecografía",
};

describe("integralMomentsInOrder", () => {
  it("con la eco antes, la pone primera", () => {
    expect(integralMomentsInOrder(VIEJO, "Dra. Tudela").map((m) => m.kind)).toEqual([
      "ULTRASOUND",
      "CONSULTATION",
    ]);
  });

  it("con la eco después, pone la consulta primera", () => {
    expect(integralMomentsInOrder(NUEVO, "Dra. Tudela").map((m) => m.kind)).toEqual([
      "CONSULTATION",
      "ULTRASOUND",
    ]);
    expect(
      integralMomentsInOrder(NUEVO_JUEVES, "Dra. Tudela").map((m) => m.kind),
    ).toEqual(["CONSULTATION", "ULTRASOUND"]);
  });

  it("sin nombre público impuesto, nombra la eco como siempre", () => {
    // El circuito viejo, intacto: la pantalla dice exactamente lo que decía.
    expect(
      integralMomentsInOrder(VIEJO, "Dra. Tudela").find(
        (m) => m.kind === "ULTRASOUND",
      )?.label,
    ).toBe("Ecografía ginecológica y mamaria");
  });

  it("con nombre público impuesto, nombra la ecografía SIN subtipo", () => {
    const eco = integralMomentsInOrder(NUEVO, "Dra. Tudela").find(
      (m) => m.kind === "ULTRASOUND",
    );
    expect(eco?.label).toBe("Ecografía");
    // La definición de Juliana, medida: la paciente nunca lee el subtipo.
    expect(eco?.label).not.toMatch(/mamaria|ginecológica/i);
  });

  it("pone el nombre de la médica en la consulta, y aguanta que no lo haya", () => {
    expect(
      integralMomentsInOrder(NUEVO, "Dra. Tudela").find(
        (m) => m.kind === "CONSULTATION",
      )?.label,
    ).toBe("Consulta con Dra. Tudela");
    expect(
      integralMomentsInOrder(NUEVO, "").find((m) => m.kind === "CONSULTATION")
        ?.label,
    ).toBe("Consulta");
  });

  it("devuelve la hora de cada momento tal cual la manda el backend", () => {
    expect(integralMomentsInOrder(NUEVO, "Dra. Tudela").map((m) => m.hour)).toEqual([
      "10:20",
      "10:40",
    ]);
  });
});

describe("integralDaySummary", () => {
  it("resume el día en el orden en el que va a pasar", () => {
    // El viejo, palabra por palabra igual que antes de esta feature.
    expect(integralDaySummary(VIEJO)).toBe("Ecografía 10:05 hs · Consulta 10:20 hs");
    expect(integralDaySummary(NUEVO)).toBe("Consulta 10:20 hs · Ecografía 10:40 hs");
  });
});

describe("integralOrderHint", () => {
  it("dice el orden y la separación REAL, no un número escrito a mano", () => {
    // Los 15 minutos del circuito viejo salen de restar las horas, así que la
    // frase quedó idéntica sin que nadie la sostenga a mano.
    expect(integralOrderHint(VIEJO)).toBe(
      "La ecografía es 15 minutos antes de la consulta: en una sola visita te hacés las dos cosas.",
    );
    expect(integralOrderHint(NUEVO)).toBe(
      "La ecografía es 20 minutos después de la consulta: en una sola visita te hacés las dos cosas.",
    );
    // El jueves la consulta dura 30': si el número estuviera cableado, mentiría.
    expect(integralOrderHint(NUEVO_JUEVES)).toContain("30 minutos después");
  });
});
