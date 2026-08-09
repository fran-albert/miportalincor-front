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
  it("🔴 tiñe el FONDO del bloque con el color del catálogo", () => {
    const colors = eventColorsFromCatalogColor("#D946EF");

    // No es blanco ni casi blanco: el bloque se reconoce por el fondo, no
    // solo por el borde.
    expect(colors.backgroundColor).toBe("#f4c8fa");
    expect(colors.borderColor).toBe("#D946EF");
  });

  it("el fondo se ve más que los pasteles del resto del calendario", () => {
    const integral = eventColorsFromCatalogColor("#D946EF");
    // El ámbar del estado PENDING, que es lo que se veía cuando el dato no
    // llegaba.
    expect(integral.backgroundColor).not.toBe("#fef3c7");
    expect(luminance(integral.backgroundColor)).toBeLessThan(
      luminance("#fef3c7"),
    );
  });

  it.each([
    "#D946EF",
    "#FDE047",
    "#000000",
    "#2196F3",
    "#4CAF50",
  ])("el texto sigue siendo legible con el color %s del catálogo", (color) => {
    // La tinta no es el color del catálogo: se elige por contraste, así que
    // el bloque se lee con cualquier color que carguen mañana.
    const { backgroundColor, textColor } = eventColorsFromCatalogColor(color);
    expect(contrastRatio(backgroundColor, textColor)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("acepta hex corto y tolera un valor inválido sin romper", () => {
    expect(eventColorsFromCatalogColor("#D4E").backgroundColor).toBe(
      eventColorsFromCatalogColor("#DD44EE").backgroundColor,
    );
    expect(eventColorsFromCatalogColor("no-es-un-color")).toEqual({
      backgroundColor: "no-es-un-color",
      textColor: "#1f2937",
      borderColor: "no-es-un-color",
    });
  });
});

/** Contraste WCAG entre dos colores. 4.5 es el mínimo AA para texto normal. */
const contrastRatio = (first: string, second: string): number => {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
};

/** Luminancia relativa, para comparar qué tan claro es un fondo. */
const luminance = (hex: string): number => {
  const normalized = hex.replace(/^#/, "");
  const channel = (start: number): number => {
    const value = parseInt(normalized.slice(start, start + 2), 16) / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
};
