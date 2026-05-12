// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import LabCard from "./card";

vi.mock("../Table/table", () => ({
  LabPatientTable: ({ fitContainer }: { fitContainer?: boolean }) => (
    <div data-fit-container={String(Boolean(fitContainer))} data-testid="lab-table" />
  ),
}));

vi.mock("@/hooks/Study/useStudyMutations", () => ({
  useStudyMutations: () => ({
    dismissParsingAlertMutation: {
      mutate: vi.fn(),
      isPending: false,
    },
  }),
}));

const baseProps = {
  studiesByUserId: [],
  bloodTestsData: [],
  bloodTests: [],
  role: "Doctor",
  idUser: 1,
};

describe("LabCard", () => {
  it("renders without the internal card shell when embedded in the modal", () => {
    render(
      <LabCard
        {...baseProps}
        variant="embedded"
        fitTableToContainer
      />
    );

    expect(screen.queryByText("Laboratorios")).not.toBeInTheDocument();
    expect(screen.getByTestId("lab-table")).toHaveAttribute(
      "data-fit-container",
      "true"
    );
    expect(screen.getByTestId("lab-table").parentElement).toHaveClass(
      "flex-1"
    );
  });

  it("keeps the card shell in the full laboratory page", () => {
    render(<LabCard {...baseProps} />);

    expect(screen.getByText("Laboratorios")).toBeInTheDocument();
    expect(screen.getByTestId("lab-table")).toHaveAttribute(
      "data-fit-container",
      "false"
    );
  });
});
