// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { EcoTypeNoteField } from "./EcoTypeNoteField";

const mockUseEcoSubtypes = vi.fn();
vi.mock("@/hooks/ConsultationType", () => ({
  useEcoSubtypes: () => mockUseEcoSubtypes() as unknown,
}));

const subtypes = [
  { id: 20, name: "Ecografía Abdominal" },
  { id: 25, name: "Ecografía Mamaria" },
];

describe("EcoTypeNoteField", () => {
  beforeEach(() => {
    mockUseEcoSubtypes.mockReturnValue({
      ecoSubtypes: subtypes,
      isLoading: false,
    });
  });

  it("elegir un tipo del catálogo lo pone como nota", () => {
    const onChange = vi.fn();
    render(
      <EcoTypeNoteField value="" onChange={onChange} detectedSubtype={null} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /ecografía mamaria/i }),
    );

    expect(onChange).toHaveBeenCalledWith("Ecografía Mamaria");
  });

  it("elegir un segundo tipo lo suma a la nota separado por coma", () => {
    const onChange = vi.fn();
    render(
      <EcoTypeNoteField
        value="Ecografía Abdominal"
        onChange={onChange}
        detectedSubtype={null}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /ecografía mamaria/i }),
    );

    expect(onChange).toHaveBeenCalledWith(
      "Ecografía Abdominal, Ecografía Mamaria",
    );
  });

  it("volver a tocar un tipo ya elegido lo saca de la nota", () => {
    const onChange = vi.fn();
    render(
      <EcoTypeNoteField
        value="Ecografía Abdominal, Ecografía Mamaria"
        onChange={onChange}
        detectedSubtype={null}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /ecografía abdominal/i }),
    );

    expect(onChange).toHaveBeenCalledWith("Ecografía Mamaria");
  });

  it("el campo de nota es texto libre editable", () => {
    const onChange = vi.fn();
    render(
      <EcoTypeNoteField value="" onChange={onChange} detectedSubtype={null} />,
    );

    fireEvent.change(screen.getByLabelText(/tipo de ecografía \/ nota/i), {
      target: { value: "Eco de control" },
    });

    expect(onChange).toHaveBeenCalledWith("Eco de control");
  });

  it("con la nota vacía avisa qué valor se va a usar automáticamente", () => {
    render(
      <EcoTypeNoteField
        value=""
        onChange={vi.fn()}
        detectedSubtype="Ecografía Abdominal, Ecografía DVC"
      />,
    );

    expect(
      screen.getByText(/se usa el tipo del turno/i),
    ).toBeInTheDocument();
  });
});
