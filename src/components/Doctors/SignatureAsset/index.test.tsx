// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DoctorSignatureAsset, DoctorSignatureAssetStatusBadge } from ".";

describe("DoctorSignatureAsset", () => {
  it("shows a clear missing state instead of a broken image", () => {
    render(<DoctorSignatureAsset label="Firma" status="missing" />);

    expect(screen.getByText("Firma no cargada")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Cargá este archivo para que el médico pueda firmar estudios cuando corresponda.",
      ),
    ).toBeInTheDocument();
  });

  it("shows unavailable state when the image fails to load", () => {
    render(
      <DoctorSignatureAsset
        label="Sello"
        src="https://example.test/broken.png"
        status="available"
      />,
    );

    fireEvent.error(screen.getByAltText("Sello"));

    expect(screen.getByText("Sello no disponible")).toBeInTheDocument();
    expect(
      screen.getByText(
        "La referencia existe, pero la imagen no se puede abrir. Volvé a cargarla.",
      ),
    ).toBeInTheDocument();
  });
});

describe("DoctorSignatureAssetStatusBadge", () => {
  it("labels available signature assets as loaded", () => {
    render(<DoctorSignatureAssetStatusBadge label="Firma" status="available" />);

    expect(screen.getByText(/Firma:\s*cargada/)).toBeInTheDocument();
  });
});
