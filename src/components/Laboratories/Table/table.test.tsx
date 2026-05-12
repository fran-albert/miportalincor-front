// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LabPatientTable } from "./table";
import type { BloodTest } from "@/types/Blod-Test/Blod-Test";
import type { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";

vi.mock("@/hooks/Blod-Test-Data/useBlodTestDataMutation", () => ({
  useBlodTestDataMutations: () => ({
    addBlodTestDataMutation: {
      mutateAsync: vi.fn(),
    },
    updateBlodTestMutation: {
      mutateAsync: vi.fn(),
    },
  }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    promiseToast: (promise: Promise<unknown>) => promise,
  }),
}));

const bloodTest = {
  id: 1,
  originalName: "Glucemia",
  referenceValue: "70-100",
  unit: {
    shortName: "mg/dL",
    name: "Miligramos por decilitro",
  },
} as BloodTest;

const bloodTestsData = [
  {
    id: 10,
    value: "90",
    bloodTest,
    study: {
      id: 20,
      date: "2026-05-01",
    },
  },
] as BloodTestData[];

describe("LabPatientTable", () => {
  it("shows a sticky save action after editing a laboratory value", async () => {
    const user = userEvent.setup();

    render(
      <LabPatientTable
        bloodTests={[bloodTest]}
        bloodTestsData={bloodTestsData}
        idUser={1}
        fitContainer
      />
    );

    const valueInput = screen.getByDisplayValue("90");

    await user.clear(valueInput);
    await user.type(valueInput, "95");

    const saveButton = screen.getByRole("button", {
      name: "Guardar Cambios",
    });

    expect(saveButton).toBeInTheDocument();
    expect(saveButton.parentElement).toHaveClass("sticky", "bottom-0");
    expect(screen.getByTestId("lab-table-scroll")).toHaveClass(
      "min-h-0",
      "flex-1"
    );
  });
});
