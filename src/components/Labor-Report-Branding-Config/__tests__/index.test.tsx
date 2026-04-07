// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LaborReportBrandingConfigManager from "..";

const mockUseBrandingConfig = vi.fn();
const mockUseBrandingMutations = vi.fn();
const mockUseDoctors = vi.fn();
const mockUseDoctorWithSignatures = vi.fn();

vi.mock(
  "@/hooks/Labor-Report-Branding-Config/useLaborReportBrandingConfig",
  () => ({
    useLaborReportBrandingConfig: (...args: unknown[]) =>
      mockUseBrandingConfig(...args),
  })
);

vi.mock(
  "@/hooks/Labor-Report-Branding-Config/useLaborReportBrandingConfigMutations",
  () => ({
    useLaborReportBrandingConfigMutations: () => mockUseBrandingMutations(),
  })
);

vi.mock("@/hooks/Doctor/useDoctors", () => ({
  useDoctors: (...args: unknown[]) => mockUseDoctors(...args),
}));

vi.mock("@/hooks/Doctor/useDoctorWithSignatures", () => ({
  useDoctorWithSignatures: (...args: unknown[]) =>
    mockUseDoctorWithSignatures(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const configFixture = {
  id: 1,
  institutionName: "INCOR Centro Médico",
  logoUrl: null,
  headerAddress: null,
  footerLegalText: null,
  active: true,
  signers: [
    {
      id: 1,
      signerKey: "default_institutional",
      name: "BONIFACIO Ma. CECILIA",
      license: "M.P. 96533 - M.L. 7299",
      specialty: "Especialista en Medicina del Trabajo",
      signatureUrl: "https://example.com/signature.png",
      sealUrl: null,
      stampText:
        "BONIFACIO Ma. CECILIA\nEspecialista en Medicina del Trabajo\nM.P. 96533 - M.L. 7299",
      hcDoctorUserId: null,
      signerType: "institutional" as const,
      active: true,
    },
  ],
  policies: [
    {
      id: 1,
      reportType: "PREOCUPACIONAL",
      section: "cover" as const,
      mode: "institutional_signer" as const,
      signer: {
        id: 1,
        signerKey: "default_institutional",
        name: "BONIFACIO Ma. CECILIA",
        license: "M.P. 96533 - M.L. 7299",
        specialty: "Especialista en Medicina del Trabajo",
        signatureUrl: "https://example.com/signature.png",
        sealUrl: null,
        stampText:
          "BONIFACIO Ma. CECILIA\nEspecialista en Medicina del Trabajo\nM.P. 96533 - M.L. 7299",
        hcDoctorUserId: null,
        signerType: "institutional" as const,
        active: true,
      },
      presentationMode: "signature_seal_and_text" as const,
    },
    {
      id: 2,
      reportType: "PREOCUPACIONAL",
      section: "clinical" as const,
      mode: "exam_doctor" as const,
      presentationMode: "signature_and_text" as const,
      signer: null,
    },
    {
      id: 3,
      reportType: "PREOCUPACIONAL",
      section: "studies" as const,
      mode: "institutional_signer" as const,
      signer: {
        id: 1,
        signerKey: "default_institutional",
        name: "BONIFACIO Ma. CECILIA",
        license: "M.P. 96533 - M.L. 7299",
        specialty: "Especialista en Medicina del Trabajo",
        signatureUrl: "https://example.com/signature.png",
        sealUrl: null,
        stampText:
          "BONIFACIO Ma. CECILIA\nEspecialista en Medicina del Trabajo\nM.P. 96533 - M.L. 7299",
        hcDoctorUserId: null,
        signerType: "institutional" as const,
        active: true,
      },
      presentationMode: "signature_seal_and_text" as const,
    },
  ],
};

describe("LaborReportBrandingConfigManager", () => {
  beforeEach(() => {
    if (!Element.prototype.hasPointerCapture) {
      Object.defineProperty(Element.prototype, "hasPointerCapture", {
        configurable: true,
        value: vi.fn(() => false),
      });
    }

    if (!Element.prototype.setPointerCapture) {
      Object.defineProperty(Element.prototype, "setPointerCapture", {
        configurable: true,
        value: vi.fn(),
      });
    }

    if (!Element.prototype.releasePointerCapture) {
      Object.defineProperty(Element.prototype, "releasePointerCapture", {
        configurable: true,
        value: vi.fn(),
      });
    }

    if (!Element.prototype.scrollIntoView) {
      Object.defineProperty(Element.prototype, "scrollIntoView", {
        configurable: true,
        value: vi.fn(),
      });
    }

    mockUseBrandingConfig.mockReturnValue({
      data: configFixture,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseBrandingMutations.mockReturnValue({
      updateConfigMutation: { isPending: false, mutateAsync: vi.fn() },
      replaceSignersMutation: { isPending: false, mutateAsync: vi.fn() },
      replacePoliciesMutation: { isPending: false, mutateAsync: vi.fn() },
    });

    mockUseDoctors.mockReturnValue({
      doctors: [
        {
          id: "doctor-1",
          userId: 101,
          firstName: "Juliana",
          lastName: "Albert",
          matricula: "M.P. 12345",
          stampText: "Dra. Juliana Albert\nCardiología\nM.P. 12345",
          specialities: [{ id: 1, name: "Cardiología" }],
          active: true,
        },
      ],
      isLoading: false,
    });

    mockUseDoctorWithSignatures.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it("renders the three admin tabs", () => {
    render(<LaborReportBrandingConfigManager />);

    expect(
      screen.getByRole("tab", { name: /Branding institucional/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Firmantes/i })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Política de firmas/i })
    ).toBeInTheDocument();
  });

  it("shows understandable previews for branding, signers and policy", async () => {
    const user = userEvent.setup();
    render(<LaborReportBrandingConfigManager />);

    expect(
      screen.getByText(/Vista previa del encabezado/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Firmantes/i }));
    expect(screen.getByText(/Vista rápida/i)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Política de firmas/i }));
    expect(
      screen.getByText(/Cómo firma hoy el informe/i)
    ).toBeInTheDocument();
  });

  it("disables policy saving when signer changes are unsaved", async () => {
    const user = userEvent.setup();
    render(<LaborReportBrandingConfigManager />);

    await user.click(screen.getByRole("tab", { name: /Firmantes/i }));

    const nameInput = screen.getByDisplayValue("BONIFACIO Ma. CECILIA");
    await user.clear(nameInput);
    await user.type(nameInput, "BONIFACIO Ma. CECILIA Editada");

    await user.click(screen.getByRole("tab", { name: /Política de firmas/i }));

    expect(
      screen.getByRole("button", { name: /Guardar política/i })
    ).toBeDisabled();
  });

  it("allows choosing a preview doctor for clinical pages without persisting it", async () => {
    const user = userEvent.setup();

    mockUseDoctorWithSignatures.mockReturnValue({
      data: {
        fullName: "Dra. Juliana Albert",
        matricula: "M.P. 12345",
        specialty: "Cardiología",
        stampText: "Dra. Juliana Albert\nCardiología\nM.P. 12345",
        signatureDataUrl: "data:image/png;base64,signature",
        sealDataUrl: undefined,
      },
      isLoading: false,
    });

    render(<LaborReportBrandingConfigManager />);

    await user.click(screen.getByRole("tab", { name: /Política de firmas/i }));
    await user.click(screen.getByRole("combobox", { name: /Médico de ejemplo/i }));
    await user.click(await screen.findByRole("option", { name: /Juliana Albert/i }));

    expect(
      screen.getByText(/Vista previa clínica con Juliana Albert/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Vista previa usando Juliana Albert/i)
    ).toBeInTheDocument();
  });
});
