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
  it("sincroniza frecuencia cardíaca desde el bloque clínico hacia circulatorio", async () => {
    const user = userEvent.setup();
    const store = renderAccordion();

    await user.clear(screen.getByLabelText("Frecuencia cardíaca"));
    await user.type(screen.getByLabelText("Frecuencia cardíaca"), "75");
    await user.click(screen.getByRole("button", { name: "Circulatorio" }));

    expect(screen.getByLabelText("Frecuencia cardíaca")).toHaveValue("75");
    expect(
      store.getState().preOccupational.formData.medicalEvaluation.circulatorio
        ?.frecuenciaCardiaca
    ).toBe("75");
  });

  it("sincroniza frecuencia cardíaca desde circulatorio hacia el bloque clínico", async () => {
    const user = userEvent.setup();
    const store = renderAccordion();

    await user.click(screen.getByRole("button", { name: "Circulatorio" }));
    await user.clear(screen.getByLabelText("Frecuencia cardíaca"));
    await user.type(screen.getByLabelText("Frecuencia cardíaca"), "81");
    await user.click(screen.getByRole("button", { name: "Clínico" }));

    expect(screen.getByLabelText("Frecuencia cardíaca")).toHaveValue("81");
    expect(
      store.getState().preOccupational.formData.medicalEvaluation.examenClinico
        .frecuenciaCardiaca
    ).toBe("81");
  });

  it("sincroniza frecuencia respiratoria desde el bloque clínico hacia respiratorio", async () => {
    const user = userEvent.setup();
    const store = renderAccordion();

    await user.clear(screen.getByLabelText("Frecuencia respiratoria"));
    await user.type(screen.getByLabelText("Frecuencia respiratoria"), "18");
    await user.click(screen.getByRole("button", { name: "Respiratorio" }));

    expect(screen.getByLabelText("Frecuencia respiratoria")).toHaveValue("18");
    expect(
      store.getState().preOccupational.formData.medicalEvaluation.respiratorio
        ?.frecuenciaRespiratoria
    ).toBe("18");
  });

  it("sincroniza frecuencia respiratoria desde respiratorio hacia el bloque clínico", async () => {
    const user = userEvent.setup();
    const store = renderAccordion();

    await user.click(screen.getByRole("button", { name: "Respiratorio" }));
    await user.clear(screen.getByLabelText("Frecuencia respiratoria"));
    await user.type(screen.getByLabelText("Frecuencia respiratoria"), "22");
    await user.click(screen.getByRole("button", { name: "Clínico" }));

    expect(screen.getByLabelText("Frecuencia respiratoria")).toHaveValue("22");
    expect(
      store.getState().preOccupational.formData.medicalEvaluation.examenClinico
        .frecuenciaRespiratoria
    ).toBe("22");
  });
});
