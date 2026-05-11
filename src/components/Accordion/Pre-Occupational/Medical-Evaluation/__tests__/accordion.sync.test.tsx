// @vitest-environment jsdom
import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import preOccupationalReducer from "@/store/Pre-Occupational/preOccupationalSlice";
import { Accordion } from "@/components/ui/accordion";

let MedicalEvaluationAccordion: typeof import("../index").default;

beforeAll(async () => {
  const storageMock = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
  };

  vi.stubGlobal("localStorage", storageMock);
  vi.stubGlobal("sessionStorage", storageMock);

  ({ default: MedicalEvaluationAccordion } = await import("../index"));
});

const renderAccordion = () => {
  const store = configureStore({
    reducer: {
      preOccupational: preOccupationalReducer,
    },
  });

  render(
    <Provider store={store}>
      <Accordion type="single" collapsible value="medical-evaluation">
        <MedicalEvaluationAccordion isEditing />
      </Accordion>
    </Provider>
  );

  return store;
};

describe("MedicalEvaluationAccordion shared clinical fields", () => {
  it("muestra todas las secciones medicas sin navegacion interna por botones", () => {
    renderAccordion();

    expect(screen.queryByRole("button", { name: "Clínico" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Respiratorio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Circulatorio" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Aspecto general").length).toBeGreaterThan(0);
    expect(screen.getByText("Mediciones")).toBeInTheDocument();
    expect(screen.getByText("Signos y mediciones")).toBeInTheDocument();
    expect(screen.getByText("Aparato respiratorio")).toBeInTheDocument();
    expect(screen.getByText("Aparato circulatorio")).toBeInTheDocument();
    expect(screen.getByText("Aparato gastrointestinal")).toBeInTheDocument();
  });

  it("sincroniza frecuencia cardíaca desde el bloque clínico hacia circulatorio", async () => {
    const user = userEvent.setup();
    const store = renderAccordion();
    const clinicalInput = screen.getByLabelText("Frecuencia cardíaca", {
      selector: "input#frecuencia-cardiaca-clinica",
    });
    const circulatoryInput = screen.getByLabelText("Frecuencia cardíaca", {
      selector: "input#circ-frecuencia",
    });

    await user.clear(clinicalInput);
    await user.type(clinicalInput, "75");

    expect(circulatoryInput).toHaveValue("75");
    expect(
      store.getState().preOccupational.formData.medicalEvaluation.circulatorio
        ?.frecuenciaCardiaca
    ).toBe("75");
  });

  it("sincroniza frecuencia cardíaca desde circulatorio hacia el bloque clínico", async () => {
    const user = userEvent.setup();
    const store = renderAccordion();
    const clinicalInput = screen.getByLabelText("Frecuencia cardíaca", {
      selector: "input#frecuencia-cardiaca-clinica",
    });
    const circulatoryInput = screen.getByLabelText("Frecuencia cardíaca", {
      selector: "input#circ-frecuencia",
    });

    await user.clear(circulatoryInput);
    await user.type(circulatoryInput, "81");

    expect(clinicalInput).toHaveValue("81");
    expect(
      store.getState().preOccupational.formData.medicalEvaluation.examenClinico
        .frecuenciaCardiaca
    ).toBe("81");
  });

  it("sincroniza frecuencia respiratoria desde el bloque clínico hacia respiratorio", async () => {
    const user = userEvent.setup();
    const store = renderAccordion();
    const clinicalInput = screen.getByLabelText("Frecuencia respiratoria", {
      selector: "input#frecuencia-respiratoria-clinica",
    });
    const respiratoryInput = screen.getByLabelText("Frecuencia respiratoria", {
      selector: "input#resp-frecuencia",
    });

    await user.clear(clinicalInput);
    await user.type(clinicalInput, "18");

    expect(respiratoryInput).toHaveValue("18");
    expect(
      store.getState().preOccupational.formData.medicalEvaluation.respiratorio
        ?.frecuenciaRespiratoria
    ).toBe("18");
  });

  it("sincroniza frecuencia respiratoria desde respiratorio hacia el bloque clínico", async () => {
    const user = userEvent.setup();
    const store = renderAccordion();
    const clinicalInput = screen.getByLabelText("Frecuencia respiratoria", {
      selector: "input#frecuencia-respiratoria-clinica",
    });
    const respiratoryInput = screen.getByLabelText("Frecuencia respiratoria", {
      selector: "input#resp-frecuencia",
    });

    await user.clear(respiratoryInput);
    await user.type(respiratoryInput, "22");

    expect(clinicalInput).toHaveValue("22");
    expect(
      store.getState().preOccupational.formData.medicalEvaluation.examenClinico
        .frecuenciaRespiratoria
    ).toBe("22");
  });
});
