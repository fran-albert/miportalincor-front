// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import preOccupationalReducer, {
  setFormData,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import type { ExamResults } from "@/common/helpers/examsResults.maps";

vi.mock("@react-pdf/renderer", () => ({
  View: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  StyleSheet: {
    create: <T,>(styles: T) => styles,
  },
}));

import TestsPreview from "../Tests";
import ExamResultsHtml from "../View/First-Page/Exams-Results";
import ExamResultsPdf from "../Pdf/First-Page/Exams-Results";
import FifthPageHTML from "../View/Fifth-Page";

const renderTestsPreview = (formData: Parameters<typeof setFormData>[0]) => {
  const store = configureStore({
    reducer: {
      preOccupational: preOccupationalReducer,
    },
  });

  store.dispatch(setFormData(formData));

  return render(
    <Provider store={store}>
      <TestsPreview />
    </Provider>
  );
};

describe("labor report content visibility", () => {
  it("shows only selected tests in report preview", () => {
    renderTestsPreview({
      testsPerformed: {
        examenFisico: true,
        glucemia: false,
        tuberculosis: false,
        espirometria: false,
        capacidadFisica: false,
        examenVisual: false,
        radiografia: false,
        audiometria: true,
        hemograma: false,
        historiaClinica: false,
        examenOrina: false,
        electrocardiograma: false,
        panelDrogas: false,
        hepaticas: false,
        psicotecnico: false,
      },
      otrasPruebas: "",
    });

    expect(screen.getByText("Examen físico")).toBeInTheDocument();
    expect(screen.getByText("Audiometría")).toBeInTheDocument();
    expect(screen.queryByText("Glucemia en Ayuna")).not.toBeInTheDocument();
    expect(screen.queryByText("Espirometría")).not.toBeInTheDocument();
  });

  it("shows a clear empty message when no tests were registered", () => {
    renderTestsPreview({
      testsPerformed: {
        examenFisico: false,
        glucemia: false,
        tuberculosis: false,
        espirometria: false,
        capacidadFisica: false,
        examenVisual: false,
        radiografia: false,
        audiometria: false,
        hemograma: false,
        historiaClinica: false,
        examenOrina: false,
        electrocardiograma: false,
        panelDrogas: false,
        hepaticas: false,
        psicotecnico: false,
      },
      otrasPruebas: "",
    });

    expect(
      screen.getByText("No se registraron pruebas realizadas")
    ).toBeInTheDocument();
    expect(screen.queryByText("Examen físico")).not.toBeInTheDocument();
  });

  it("hides empty exam result rows in HTML preview", () => {
    render(
      <ExamResultsHtml
        examResults={{
          clinico: "Apto",
          audiometria: "",
          psicotecnico: "   ",
          laboratorio: "Normal",
        } as ExamResults}
      />
    );

    expect(screen.getByText("Clinico")).toBeInTheDocument();
    expect(screen.getByText("Apto")).toBeInTheDocument();
    expect(screen.getByText("Laboratorio basico ley")).toBeInTheDocument();
    expect(screen.queryByText("Audiometria")).not.toBeInTheDocument();
    expect(screen.queryByText("Psicotecnico")).not.toBeInTheDocument();
    expect(screen.queryByText("Sin dato registrado")).not.toBeInTheDocument();
  });

  it("oculta la seccion de resultados cuando no hay datos (HTML y PDF)", () => {
    const emptyResults = {} as ExamResults;

    const { container, unmount } = render(
      <ExamResultsHtml examResults={emptyResults} />
    );

    // Regla de visibilidad: sin resultados, la seccion no se renderiza.
    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByText("Resultados del examen")
    ).not.toBeInTheDocument();

    unmount();

    const { container: pdfContainer } = render(
      <ExamResultsPdf examResults={emptyResults} />
    );
    expect(pdfContainer).toBeEmptyDOMElement();
  });

  it("ignores old gineco-obstetric force_hide overrides in HTML preview", () => {
    render(
      <FifthPageHTML
        collaboratorGender="femenino"
        genitourinaryGynObVisibilityMode="force_hide"
        gastrointestinal={{}}
        genitourinario={{
          fum: "2026-01-10",
          embarazos: "1",
          partos: "",
          cesarea: "",
        }}
        osteoarticular={{}}
        doctorData={{
          fullName: "",
          matricula: "",
          specialty: "",
          stampText: "",
          signatureDataUrl: "",
        }}
        medicalEvaluationType="preocupacional"
      />
    );

    expect(screen.getByText("F.U.M.")).toBeInTheDocument();
    expect(screen.getByText("2026-01-10")).toBeInTheDocument();
    expect(screen.getByText("Embarazos")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
