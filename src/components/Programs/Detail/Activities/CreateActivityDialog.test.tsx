// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CreateActivityDialog from "./CreateActivityDialog";
import { ProgramTariffType } from "@/types/Program/ProgramActivity";

const mockCreate = vi.fn();

vi.mock("@/hooks/Program/useActivityMutations", () => ({
  useActivityMutations: () => ({
    createActivityMutation: {
      mutateAsync: mockCreate,
      isPending: false,
    },
  }),
}));

vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({
    promiseToast: <T,>(promise: Promise<T>) => promise,
  }),
}));

describe("CreateActivityDialog", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("convierte el precio visible en pesos a centavos exactos", async () => {
    mockCreate.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <CreateActivityDialog
        programId="program-1"
        isOpen
        setIsOpen={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText("Nombre"), "Nutrición");
    await user.type(screen.getByLabelText("Precio lista en pesos"), "30000");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith({
        name: "Nutrición",
        description: "",
        tariffType: ProgramTariffType.PER_SESSION,
        unitPriceCents: "3000000",
      })
    );
  });
});
