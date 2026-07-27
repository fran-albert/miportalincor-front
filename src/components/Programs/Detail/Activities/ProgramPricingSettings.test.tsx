// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProgramPricingSettings from "./ProgramPricingSettings";

const mockUseProgramPricing = vi.fn();
const mockUseProgramPricingMutation = vi.fn();

vi.mock("@/hooks/Program/useProgramPricing", () => ({
  useProgramPricing: () => mockUseProgramPricing(),
  useProgramPricingMutation: () => mockUseProgramPricingMutation(),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

describe("ProgramPricingSettings", () => {
  beforeEach(() => {
    mockUseProgramPricing.mockReturnValue({
      data: { discountPercent: 10, discountBasisPoints: 1000 },
      isLoading: false,
      isError: false,
    });
    mockUseProgramPricingMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("deja el descuento sólo lectura para el profesional", () => {
    render(<ProgramPricingSettings programId="program-1" canManage={false} />);

    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.queryByLabelText("Porcentaje")).toBeNull();
    expect(screen.queryByRole("button", { name: "Guardar" })).toBeNull();
  });

  it("habilita la edición para Admin o coordinador", () => {
    render(<ProgramPricingSettings programId="program-1" canManage />);

    expect(screen.getByLabelText("Porcentaje")).toHaveValue("10");
    expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
  });
});
