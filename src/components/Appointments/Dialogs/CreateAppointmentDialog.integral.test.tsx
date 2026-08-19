import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateAppointmentDialog } from "./CreateAppointmentDialog";

/**
 * El control ginecológico integral, dentro del alta de turnos del turnero.
 *
 * Por qué vive acá y no en una pantalla nueva: el control ya tenía dos
 * representaciones y cada lugar elegía una. Dos entradas de UI sobre **un solo
 * camino de alta en el backend** está bien; dos altas distintas, no. Por eso
 * lo único que este diálogo hace es elegir qué formulario mostrar y mandarle
 * al backend la paciente y el día.
 */

const roles = vi.fn(() => ({
  isPatient: false,
  isDoctor: false,
  isSecretary: true,
  isAdmin: false,
}));

vi.mock("@/hooks/useRoles", () => ({
  default: () => roles(),
}));

const createStaffIntegral = vi.fn().mockResolvedValue({
  consultation: { id: 1 },
  ultrasound: { id: 2 },
});

vi.mock("@/hooks/Appointments", () => ({
  useAppointmentMutations: () => ({
    createAppointment: { mutateAsync: vi.fn() },
    isCreating: false,
  }),
  useCreateGuestAppointment: () => ({
    createGuestAppointment: { mutateAsync: vi.fn() },
    isCreating: false,
  }),
  useCreateStaffIntegralAppointment: () => ({
    mutateAsync: createStaffIntegral,
    isPending: false,
  }),
}));

const showSuccess = vi.fn();
vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showSuccess, showError: vi.fn() }),
}));

vi.mock("../Forms/CreateAppointmentForm", () => ({
  CreateAppointmentForm: () => <div data-testid="alta-comun" />,
}));

vi.mock("../Forms/StaffIntegralCheckupForm", () => ({
  StaffIntegralCheckupForm: ({
    onSubmit,
  }: {
    onSubmit: (data: { patientId: number; date: string }) => Promise<void>;
  }) => (
    <div data-testid="alta-integral">
      <button
        type="button"
        onClick={() => void onSubmit({ patientId: 501, date: "2027-03-10" })}
      >
        Dar el control
      </button>
    </div>
  ),
}));

describe("CreateAppointmentDialog · control integral", () => {
  beforeEach(() => {
    roles.mockReturnValue({
      isPatient: false,
      isDoctor: false,
      isSecretary: true,
      isAdmin: false,
    });
    createStaffIntegral.mockClear();
    showSuccess.mockClear();
  });

  const abrir = async () => {
    render(<CreateAppointmentDialog open onOpenChange={vi.fn()} />);
    return userEvent.setup();
  };

  it("le ofrece a la secretaria elegir entre el turno común y el control", async () => {
    await abrir();

    expect(
      screen.getByRole("button", { name: /control ginecológico integral/i }),
    ).toBeInTheDocument();
    // Y arranca en el alta de siempre: el control es la excepción, no el default.
    expect(screen.getByTestId("alta-comun")).toBeInTheDocument();
  });

  it("no se lo ofrece a un médico: el control lo da secretaría", async () => {
    roles.mockReturnValue({
      isPatient: false,
      isDoctor: true,
      isSecretary: false,
      isAdmin: false,
    });
    await abrir();

    expect(
      screen.queryByRole("button", { name: /control ginecológico integral/i }),
    ).not.toBeInTheDocument();
  });

  it("al elegir el control cambia al recorrido del control", async () => {
    const user = await abrir();

    await user.click(
      screen.getByRole("button", { name: /control ginecológico integral/i }),
    );

    expect(screen.getByTestId("alta-integral")).toBeInTheDocument();
    expect(screen.queryByTestId("alta-comun")).not.toBeInTheDocument();
  });

  it("manda al backend la paciente y el día, y nada más", async () => {
    const user = await abrir();

    await user.click(
      screen.getByRole("button", { name: /control ginecológico integral/i }),
    );
    await user.click(screen.getByRole("button", { name: /dar el control/i }));

    await waitFor(() => {
      expect(createStaffIntegral).toHaveBeenCalledWith({
        patientId: 501,
        date: "2027-03-10",
      });
    });
    expect(showSuccess).toHaveBeenCalled();
  });
});
