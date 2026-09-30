// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DataValue } from "@/types/Data-Value/Data-Value";
import type { Osteoarticular } from "@/store/Pre-Occupational/preOccupationalSlice";
import { mapOsteoarticular } from "@/common/helpers/maps";

vi.mock("@react-pdf/renderer", () => ({
  View: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  StyleSheet: {
    create: <T,>(styles: T) => styles,
  },
}));

import { OsteoarticularSection } from "@/components/Accordion/Pre-Occupational/Medical-Evaluation/OsteoArticularSection";
import OsteoarticularHtml from "../View/Fourth-Page/Osteoarticular";
import OsteoarticularPdf from "../Pdf/Fifth-Page/Osteoarticular";

const emptyOsteo: Osteoarticular = {
  mmssSin: undefined,
  mmssObs: "",
  mmiiSin: undefined,
  mmiiObs: "",
  columnaSin: undefined,
  columnaObs: "",
  amputaciones: undefined,
  amputacionesObs: "",
};

const storedAmputaciones = (value: string, observations?: string): DataValue =>
  ({
    id: 1,
    name: "Amputaciones",
    dataType: {
      id: 136,
      name: "Amputaciones",
      category: "EXAMEN_FISICO",
      dataType: "BOOLEAN",
    },
    value,
    observations,
  }) as DataValue;

// Recorre el camino completo: opción elegida en el formulario → valor guardado
// ("true"/"false" en data_values) → dato leído de vuelta → texto del informe.
const reportTextFor = async (option: "Si" | "No") => {
  const user = userEvent.setup();
  let chosen: Partial<Osteoarticular> = {};

  render(
    <OsteoarticularSection
      isEditing
      data={emptyOsteo}
      onChange={(field, value) => {
        chosen = { ...chosen, [field]: value };
      }}
      onBatchChange={(updates) => {
        chosen = { ...chosen, ...updates };
      }}
    />
  );

  const heading = screen.getByRole("heading", { name: "Amputaciones" });
  const section = heading.closest("section");
  if (!section) throw new Error("No se encontró el bloque Amputaciones");
  await user.click(within(section).getByRole("radio", { name: option }));
  cleanup();

  const stored = mapOsteoarticular([
    storedAmputaciones(String(chosen.amputaciones)),
  ]);

  const html = render(<OsteoarticularHtml data={stored} />);
  const htmlText = html.container.textContent ?? "";
  cleanup();

  const pdf = render(<OsteoarticularPdf {...stored} />);
  const pdfText = pdf.container.textContent ?? "";
  cleanup();

  return { htmlText, pdfText };
};

describe("Amputaciones: del formulario al informe", () => {
  it("si la médica marca que no hay amputaciones, el informe dice No", async () => {
    const { htmlText, pdfText } = await reportTextFor("No");

    expect(htmlText).toContain("AmputacionesNo");
    expect(pdfText).toContain("AmputacionesNo");
  });

  it("si la médica marca que hay amputaciones, el informe dice Sí", async () => {
    const { htmlText, pdfText } = await reportTextFor("Si");

    expect(htmlText).toContain("AmputacionesSí");
    expect(pdfText).toContain("AmputacionesSí");
  });

  it("un registro con amputación y observación la imprime", () => {
    const stored = mapOsteoarticular([
      storedAmputaciones("1", "FALTA 3º FALANGE 2º DEDO MANO IZQUIERDA"),
    ]);

    render(<OsteoarticularPdf {...stored} />);

    expect(document.body.textContent).toContain(
      "Sí · FALTA 3º FALANGE 2º DEDO MANO IZQUIERDA"
    );
  });
});
