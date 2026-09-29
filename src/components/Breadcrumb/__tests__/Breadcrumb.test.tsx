// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import BreadcrumbComponent from "../index";

describe("BreadcrumbComponent", () => {
  it("por default capitaliza cada palabra, como hasta ahora", () => {
    render(
      <MemoryRouter>
        <BreadcrumbComponent
          items={[{ label: "Inicio", href: "/inicio" }, { label: "mis estudios" }]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("mis estudios")).toHaveClass("capitalize");
  });

  it("respeta las mayusculas del texto si el item lo pide", () => {
    render(
      <MemoryRouter>
        <BreadcrumbComponent
          items={[
            { label: "Inicio", href: "/inicio", preserveCase: true },
            { label: "Mi carnet de vacunación", preserveCase: true },
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Mi carnet de vacunación")).not.toHaveClass(
      "capitalize"
    );
    expect(screen.getByText("Inicio")).not.toHaveClass("capitalize");
  });
});
