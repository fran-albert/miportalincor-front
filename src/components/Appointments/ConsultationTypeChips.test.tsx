import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConsultationTypeChips } from "./ConsultationTypeChips";

describe("ConsultationTypeChips", () => {
  it("un turno de un solo estudio muestra un chip con ese nombre", () => {
    render(<ConsultationTypeChips labels={["Ergometría"]} />);

    expect(screen.getByText("Ergometría")).toBeInTheDocument();
  });

  it("🔴 un turno de dos estudios los nombra a los dos, sin +1", () => {
    render(
      <ConsultationTypeChips
        labels={["Ecocardiograma Doppler Color", "Ergometría"]}
      />,
    );

    expect(screen.getByText("Ecocardiograma Doppler Color")).toBeInTheDocument();
    expect(screen.getByText("Ergometría")).toBeInTheDocument();
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("🔴 el turno de cuatro estudios nombra los cuatro", () => {
    const labels = [
      "Ecocardiograma Doppler Color",
      "Doppler de Vasos de Cuello",
      "Electrocardiograma",
      "Ergometría",
    ];

    render(<ConsultationTypeChips labels={labels} />);

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
  });

  it("cada chip lleva el nombre completo para el hover", () => {
    render(<ConsultationTypeChips labels={["Ecografía Vesicoprostática"]} />);

    expect(screen.getByText("Ecografía Vesicoprostática")).toHaveAttribute(
      "title",
      "Ecografía Vesicoprostática",
    );
  });

  it("sin estudios no muestra nada", () => {
    const { container } = render(<ConsultationTypeChips labels={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("en una columna angosta recorta el chip en vez de desbordar la tabla", () => {
    render(
      <ConsultationTypeChips
        labels={["Ecografía Renal y Vías Urinarias"]}
        narrow
      />,
    );

    const chip = screen.getByText("Ecografía Renal y Vías Urinarias");
    expect(chip.className).toContain("truncate");
    expect(chip.className).toMatch(/max-w-/);
  });

  it("los chips envuelven en anchos chicos en vez de desbordar", () => {
    const { container } = render(
      <ConsultationTypeChips labels={["Ergometría", "Electrocardiograma"]} />,
    );

    expect(container.firstElementChild?.className).toContain("flex-wrap");
  });
});
