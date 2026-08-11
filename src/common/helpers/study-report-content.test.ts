import { describe, expect, it } from "vitest";
import { applyStudyReportField } from "./study-report-content";

describe("el contenido del informe cuando la médica edita un campo", () => {
  it("guarda el número que escribió", () => {
    expect(applyStudyReportField({}, "rightKidneyApMm", 46)).toEqual({
      rightKidneyApMm: 46,
    });
  });

  it("guarda el cero: es una medición, no un campo vacío", () => {
    expect(
      applyStudyReportField({}, "bladderPostvoidResidualCc", 0),
    ).toEqual({ bladderPostvoidResidualCc: 0 });
  });

  it("🔴 borrar un cuadro numérico lo saca del contenido, no lo deja en ''", () => {
    // `valueAsNumber` de un <input type="number"> vacío es NaN. Dejarlo como
    // "" hacía que el backend rechazara el autoguardado del borrador entero.
    const content = applyStudyReportField(
      { rightKidneyApMm: 46, bladderPostvoidResidualCc: 12 },
      "bladderPostvoidResidualCc",
      Number.NaN,
    );

    expect(content).toEqual({ rightKidneyApMm: 46 });
    expect(content).not.toHaveProperty("bladderPostvoidResidualCc");
  });

  it("un número a medio tipear tampoco ensucia el contenido", () => {
    // Escribir "1." o "-" también deja `valueAsNumber` en NaN.
    expect(
      applyStudyReportField({ prostateVolumeCc: 40 }, "prostateVolumeCc", Number.NaN),
    ).toEqual({});
  });

  it("un campo de texto vacío se conserva: ahí el vacío es el valor", () => {
    expect(
      applyStudyReportField({ prostateFindings: "Agrandada." }, "prostateFindings", ""),
    ).toEqual({ prostateFindings: "" });
  });

  it("no muta el contenido anterior", () => {
    const anterior = { rightKidneyApMm: 46 };

    applyStudyReportField(anterior, "rightKidneyApMm", Number.NaN);

    expect(anterior).toEqual({ rightKidneyApMm: 46 });
  });
});
