// @vitest-environment jsdom
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import LaboralIncorComponent from "..";

const mockUseRoles = vi.fn();

vi.mock("@/hooks/useRoles", () => ({
  default: () => mockUseRoles(),
}));

describe("LaboralIncorComponent", () => {
  beforeEach(() => {
    mockUseRoles.mockReturnValue({
      isAdmin: false,
    });
  });

  it("hides the branding config access card for non-admin users", () => {
    render(
      <MemoryRouter>
        <LaboralIncorComponent />
      </MemoryRouter>
    );

    expect(screen.queryByText("Informes laborales")).not.toBeInTheDocument();
  });

  it("shows the branding config access card for admin users", () => {
    mockUseRoles.mockReturnValue({
      isAdmin: true,
    });

    render(
      <MemoryRouter>
        <LaboralIncorComponent />
      </MemoryRouter>
    );

    expect(screen.getByText("Informes laborales")).toBeInTheDocument();
  });
});
