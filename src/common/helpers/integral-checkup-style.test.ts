import { describe, expect, it } from "vitest";
import {
  eventColorsFromCatalogColor,
  resolveIntegralCheckupEventColors,
} from "./integral-checkup-style";
import { INTEGRAL_CHECKUP_FALLBACK_COLOR } from "@/common/constants/integral-checkup";

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

/** Lo que el backend manda como color del control (tipo del catálogo). */
const CATALOG_COLOR = "#D946EF";

describe("el color del control ginecológico integral en el turnero", () => {
  it("pinta el color del control, con prioridad sobre el del tipo de consulta", () => {
    const colors = resolveIntegralCheckupEventColors({
      isIntegralCheckup: true,
      isCancelled: false,
      color: CATALOG_COLOR,
      fallback: CONSULTATION_TYPE_COLORS,
    });

    expect(colors).toEqual(eventColorsFromCatalogColor(CATALOG_COLOR));
    expect(colors.backgroundColor).not.toBe(
      CONSULTATION_TYPE_COLORS.backgroundColor,
    );
  });

  it("🔴 el valor sale del catálogo: si cambia el hex, cambia lo que se pinta", () => {
    const withCatalogColor = resolveIntegralCheckupEventColors({
      isIntegralCheckup: true,
      isCancelled: false,
      color: "#123456",
      fallback: CONSULTATION_TYPE_COLORS,
    });

    expect(withCatalogColor.borderColor).toBe("#123456");
    expect(withCatalogColor.borderColor).not.toBe(
      INTEGRAL_CHECKUP_FALLBACK_COLOR,
    );
  });

  it("si el backend no manda color, cae al fallback en vez de perder el resaltado", () => {
    const colors = resolveIntegralCheckupEventColors({
      isIntegralCheckup: true,
      isCancelled: false,
      fallback: CONSULTATION_TYPE_COLORS,
    });

    expect(colors).toEqual(
      eventColorsFromCatalogColor(INTEGRAL_CHECKUP_FALLBACK_COLOR),
    );
    expect(colors).not.toEqual(CONSULTATION_TYPE_COLORS);
  });

  it("no altera los turnos comunes de esos mismos tipos", () => {
    expect(
      resolveIntegralCheckupEventColors({
        isIntegralCheckup: false,
        isCancelled: false,
        color: CATALOG_COLOR,
        fallback: CONSULTATION_TYPE_COLORS,
      }),
    ).toEqual(CONSULTATION_TYPE_COLORS);
  });

  it("el color del control no tapa que un turno esté cancelado", () => {
    expect(
      resolveIntegralCheckupEventColors({
        isIntegralCheckup: true,
        isCancelled: true,
        color: CATALOG_COLOR,
        fallback: CANCELLED_COLORS,
      }),
    ).toEqual(CANCELLED_COLORS);
  });

  it("se aplica por el vínculo, no por el tipo de consulta", () => {
    // Dos turnos del MISMO tipo (mismo fallback) terminan con colores
    // distintos: la única diferencia es estar vinculados. Es lo que permite
    // pintar también el sobreturno, que no puede tener tipo.
    const integral = resolveIntegralCheckupEventColors({
      isIntegralCheckup: true,
      isCancelled: false,
      color: CATALOG_COLOR,
      fallback: CONSULTATION_TYPE_COLORS,
    });
    const common = resolveIntegralCheckupEventColors({
      isIntegralCheckup: false,
      isCancelled: false,
      color: CATALOG_COLOR,
      fallback: CONSULTATION_TYPE_COLORS,
    });

    expect(integral).not.toEqual(common);
  });
});

describe("eventColorsFromCatalogColor", () => {
  it("usa el hex del catálogo como borde y texto, con fondo translúcido", () => {
    expect(eventColorsFromCatalogColor("#D946EF")).toEqual({
      backgroundColor: "#D946EF1F",
      textColor: "#D946EF",
      borderColor: "#D946EF",
    });
  });
});
