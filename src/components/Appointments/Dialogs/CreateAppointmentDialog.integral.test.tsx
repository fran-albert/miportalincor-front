import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateAppointmentDialog } from "./CreateAppointmentDialog";

/**
 * El control ginecológico integral, dentro del alta de turnos del turnero.
 *
 * El recorrido es el que pidió Francisco el 19/08: **primero el médico**, y
 * recién si ese médico ofrece el control aparecen debajo las dos modalidades;
 * después el paciente y las fechas. Con cualquier otro médico el alta común no
 * cambia en nada.
 *
 * 🔴 La invariante que gobierna este archivo: **el front no cablea quién es la
 * ginecóloga**. La respuesta la da el backend (`/integral/config`) y acá solo
 * se compara. Por eso el id que aparece en los tests es el que devuelve el
 * servidor mockeado, no una constante del front: cambiándolo del lado del
 * servidor, la pantalla lo sigue.
 *
 * Por qué el control vive acá y no en una pantalla nueva: ya tenía dos
 * representaciones y cada lugar elegía una. Dos entradas de UI sobre **un solo
 * camino de alta en el backend** está bien; dos altas distintas, no.
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

/** Lo que contesta el backend cuando le preguntan quién ofrece el control. */
const config = vi.fn<
  () => { consultationDoctorId: number; ultrasoundDoctorId: number } | undefined
>(() => ({ consultationDoctorId: 388, ultrasoundDoctorId: 176 }));

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
  useIntegralCheckupConfig: () => ({ config: config() }),
}));

const showSuccess = vi.fn();
vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showSuccess, showError: vi.fn() }),
}));

/**
 * El alta común, reducida a lo que este diálogo le pide: elegir médico, y
 * mostrar donde corresponda lo que el diálogo le pasa. El orden de los campos
 * —y que la modalidad caiga entre el médico y el paciente— lo prueba
 * `CreateAppointmentForm.integral.test.tsx`, sobre el formulario de verdad.
 */
vi.mock("../Forms/CreateAppointmentForm", () => ({
  CreateAppointmentForm: ({
    onDoctorChange,
    afterDoctorField,
    fieldsBelowDoctorOverride,
  }: {
    onDoctorChange?: (doctorId: number | undefined) => void;
    afterDoctorField?: React.ReactNode;
    fieldsBelowDoctorOverride?: React.ReactNode;
  }) => (
    <div data-testid="alta-comun">
      <button type="button" onClick={() => onDoctorChange?.(388)}>
        Elegir a la ginecóloga
      </button>
      <button type="button" onClick={() => onDoctorChange?.(12)}>
        Elegir a otro médico
      </button>
      {afterDoctorField}
      {fieldsBelowDoctorOverride ?? <div data-testid="campos-del-turno-comun" />}
    </div>
  ),
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

const laModalidad = () =>
  screen.queryByRole("button", { name: /control ginecológico integral/i });

describe("CreateAppointmentDialog · control integral", () => {
  beforeEach(() => {
    roles.mockReturnValue({
      isPatient: false,
      isDoctor: false,
      isSecretary: true,
      isAdmin: false,
    });
    config.mockReturnValue({
      consultationDoctorId: 388,
      ultrasoundDoctorId: 176,
    });
    createStaffIntegral.mockClear();
    showSuccess.mockClear();
  });

  const abrir = async () => {
    render(<CreateAppointmentDialog open onOpenChange={vi.fn()} />);
    return userEvent.setup();
  };

  it("no ofrece modalidades hasta que se elige un médico", async () => {
    await abrir();

    expect(laModalidad()).not.toBeInTheDocument();
    expect(screen.getByTestId("campos-del-turno-comun")).toBeInTheDocument();
  });

  it("con un médico que no ofrece el control, el alta común no cambia en nada", async () => {
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /otro médico/i }));

    expect(laModalidad()).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /turno común/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("campos-del-turno-comun")).toBeInTheDocument();
  });

  it("al elegir a la ginecóloga aparecen las dos modalidades, en el turno común", async () => {
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));

    expect(laModalidad()).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /turno común/i }),
    ).toBeInTheDocument();
    // Arranca en el alta de siempre: el control es la excepción, no el default.
    expect(screen.getByTestId("campos-del-turno-comun")).toBeInTheDocument();
    expect(screen.queryByTestId("alta-integral")).not.toBeInTheDocument();
  });

  it("quién ofrece el control lo dice el backend, no el front", async () => {
    // Otra instancia, otra ginecóloga: el mismo front la sigue. Si el id
    // estuviera cableado, este test se caería.
    config.mockReturnValue({ consultationDoctorId: 12, ultrasoundDoctorId: 176 });
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));
    expect(laModalidad()).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /otro médico/i }));
    expect(laModalidad()).toBeInTheDocument();
  });

  it("mientras el backend no contesta, no se ofrece nada", async () => {
    config.mockReturnValue(undefined);
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));

    expect(laModalidad()).not.toBeInTheDocument();
  });

  it("elegir el control cambia el recorrido, y el médico se queda arriba", async () => {
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));
    await user.click(laModalidad()!);

    expect(screen.getByTestId("alta-integral")).toBeInTheDocument();
    expect(
      screen.queryByTestId("campos-del-turno-comun"),
    ).not.toBeInTheDocument();
    // El médico y las dos modalidades siguen visibles: se puede volver.
    expect(
      screen.getByRole("button", { name: /la ginecóloga/i }),
    ).toBeInTheDocument();
    expect(laModalidad()).toBeInTheDocument();
  });

  it("y se puede volver al turno común sin cerrar el diálogo", async () => {
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));
    await user.click(laModalidad()!);
    await user.click(screen.getByRole("button", { name: /turno común/i }));

    expect(screen.getByTestId("campos-del-turno-comun")).toBeInTheDocument();
    expect(screen.queryByTestId("alta-integral")).not.toBeInTheDocument();
  });

  it("si cambia a un médico que no lo ofrece, el control se cae solo", async () => {
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));
    await user.click(laModalidad()!);
    await user.click(screen.getByRole("button", { name: /otro médico/i }));

    // Quedarse en el recorrido del control con otro médico elegido sería dar
    // un control en la agenda equivocada.
    expect(screen.queryByTestId("alta-integral")).not.toBeInTheDocument();
    expect(screen.getByTestId("campos-del-turno-comun")).toBeInTheDocument();
    expect(laModalidad()).not.toBeInTheDocument();
  });

  it("no se lo ofrece a un médico: el control lo da secretaría", async () => {
    roles.mockReturnValue({
      isPatient: false,
      isDoctor: true,
      isSecretary: false,
      isAdmin: false,
    });
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));

    expect(laModalidad()).not.toBeInTheDocument();
  });

  it("manda al backend la paciente y el día, y nada más", async () => {
    const user = await abrir();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));
    await user.click(laModalidad()!);
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
