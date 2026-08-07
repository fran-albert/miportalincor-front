import { describe, expect, it } from "vitest";
import { resolveIntegralCheckupEventColors } from "./integral-checkup-style";
import { INTEGRAL_CHECKUP_COLORS } from "@/common/constants/integral-checkup";

/** El verde de "Ecografía Ginecológica" en el catálogo de tipos. */
const CONSULTATION_TYPE_COLORS = {
  backgroundColor: "#d9f2e3",
  textColor: "#166534",
  borderColor: "#34a853",
};

const CANCELLED_COLORS = {
  backgroundColor: "#fee2e2",
  textColor: "#b91c1c",
  borderColor: "#f87171",
};

describe("el color del control ginecológico integral en el turnero", () => {
  it("pinta fucsia, con prioridad sobre el color del tipo de consulta", () => {
    const colors = resolveIntegralCheckupEventColors({
      isIntegralCheckup: true,
      isCancelled: false,
      fallback: CONSULTATION_TYPE_COLORS,
    });

    expect(colors).toEqual({
      backgroundColor: INTEGRAL_CHECKUP_COLORS.background,
      textColor: INTEGRAL_CHECKUP_COLORS.text,
      borderColor: INTEGRAL_CHECKUP_COLORS.border,
    });
    expect(colors.backgroundColor).not.toBe(
      CONSULTATION_TYPE_COLORS.backgroundColor,
    );
  });

  it("no altera los turnos comunes de esos mismos tipos", () => {
    expect(
      resolveIntegralCheckupEventColors({
        isIntegralCheckup: false,
        isCancelled: false,
        fallback: CONSULTATION_TYPE_COLORS,
      }),
    ).toEqual(CONSULTATION_TYPE_COLORS);
  });

  it("el fucsia no tapa que un turno esté cancelado", () => {
    expect(
      resolveIntegralCheckupEventColors({
        isIntegralCheckup: true,
        isCancelled: true,
        fallback: CANCELLED_COLORS,
      }),
    ).toEqual(CANCELLED_COLORS);
  });

  it("el fucsia sale del vínculo, no del catálogo de tipos", () => {
    // Dos turnos del MISMO tipo (mismo fallback) terminan con colores
    // distintos: la única diferencia es estar vinculados.
    const integral = resolveIntegralCheckupEventColors({
      isIntegralCheckup: true,
      isCancelled: false,
      fallback: CONSULTATION_TYPE_COLORS,
    });
    const common = resolveIntegralCheckupEventColors({
      isIntegralCheckup: false,
      isCancelled: false,
      fallback: CONSULTATION_TYPE_COLORS,
    });

    expect(integral).not.toEqual(common);
  });
});
