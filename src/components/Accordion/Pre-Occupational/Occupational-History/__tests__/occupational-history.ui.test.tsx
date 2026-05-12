// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import preOccupationalReducer, {
  setFormData,
  type OccupationalHistoryItem,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { Accordion } from "@/components/ui/accordion";
import OccupationalHistoryAccordion from "../index";

const renderOccupationalHistory = (
  isEditing = true,
  occupationalHistory: OccupationalHistoryItem[] = []
) => {
  const store = configureStore({
    reducer: {
      preOccupational: preOccupationalReducer,
    },
  });

  if (occupationalHistory.length > 0) {
    store.dispatch(setFormData({ occupationalHistory }));
  }

  render(
    <Provider store={store}>
      <Accordion type="single" collapsible value="occupational-history">
        <OccupationalHistoryAccordion isEditing={isEditing} />
      </Accordion>
    </Provider>
  );

  return store;
};

describe("OccupationalHistoryAccordion", () => {
  it("does not render the old helper copy and keeps add/edit working", async () => {
    const user = userEvent.setup();
    const store = renderOccupationalHistory();

    expect(
      screen.queryByText(/Registrá antecedentes laborales previos/)
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Nuevo antecedente/i })
    );
    await user.type(screen.getByLabelText("Antecedente 1"), "Trabajo previo");

    expect(
      store.getState().preOccupational.formData.occupationalHistory[0]
        .description
    ).toBe("Trabajo previo");
  });

  it("renders antecedente groups without card styling", () => {
    renderOccupationalHistory(true, [
      {
        id: "antecedente-1",
        description: "Exposición a ruido",
      },
    ]);

    const section = screen
      .getByRole("heading", { name: "Antecedente 1" })
      .closest("section");

    expect(section).toHaveClass("space-y-3");
    expect(section).not.toHaveClass("rounded-xl");
    expect(section).not.toHaveClass("shadow-sm");
  });
});
