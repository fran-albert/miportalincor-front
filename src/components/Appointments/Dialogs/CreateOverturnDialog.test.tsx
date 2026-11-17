import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateOverturnDialog } from "./CreateOverturnDialog";

/**
 * Estudio / tipo de consulta del sobreturno.
 *
 * El MAPA casi siempre se da como sobreturno y la agenda lo pinta con el color
 * del estudio solo si el sobreturno lo guarda. La invariante: si la secretaria
 * elige un tipo, el alta lo manda; si no elige ninguno, el pedido es el mismo
 * de siempre (sin `consultationTypeId`).
 */

const showError = vi.fn();
const showSuccess = vi.fn();
vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showError, showSuccess }),
}));

const createOverturn = vi.fn().mockResolvedValue({});
const createGuestOverturn = vi.fn().mockResolvedValue({});
vi.mock("@/hooks/Overturns", () => ({
  useOverturnMutations: () => ({
    createOverturn: { mutateAsync: createOverturn },
    isCreating: false,
  }),
  useCreateGuestOverturn: () => ({
    createGuestOverturn: { mutateAsync: createGuestOverturn },
    isCreating: false,
  }),
}));

vi.mock("@/hooks/Doctor/useDoctors", () => ({
  useDoctors: () => ({ doctors: [], isLoading: false }),
}));

vi.mock("../Select/DoctorSelect", () => ({
  DoctorSelect: () => <div>médico</div>,
}));

vi.mock("../Select/PatientSelectWithGuestOption", () => ({
  PatientSelectWithGuestOption: ({
    onValueChange,
    onCreateGuestClick,
  }: {
    onValueChange: (id: number) => void;
    onCreateGuestClick?: (documentNumber: string) => void;
  }) => (
    <>
      <button type="button" onClick={() => onValueChange(501)}>
        Elegir paciente
      </button>
      <button type="button" onClick={() => onCreateGuestClick?.("30111222")}>
        Crear invitado
      </button>
    </>
  ),
}));

/** Con qué médico se pidió la lista de tipos permitidos. */
const consultationTypeSelectDoctorIds: Array<number | undefined> = [];
vi.mock("../Select/ConsultationTypeSelect", () => ({
  ConsultationTypeSelect: ({
    onValueChange,
    doctorId,
  }: {
    onValueChange: (id: number | undefined) => void;
    doctorId?: number;
  }) => {
    consultationTypeSelectDoctorIds.push(doctorId);
    return (
      <button type="button" onClick={() => onValueChange(900)}>
        Elegir MAPA
      </button>
    );
  },
}));

const renderDialog = () =>
  render(
    <CreateOverturnDialog
      open
      onOpenChange={vi.fn()}
      defaultDoctorId={388}
      defaultDate="2026-11-20"
    />,
  );

const setHour = (hour: string) => {
  fireEvent.change(screen.getByPlaceholderText("HH:MM"), {
    target: { value: hour },
  });
};

describe("CreateOverturnDialog — estudio / tipo de consulta", () => {
  beforeEach(() => {
    createOverturn.mockClear();
    createGuestOverturn.mockClear();
    consultationTypeSelectDoctorIds.length = 0;
  });

  it("manda consultationTypeId cuando se elige un tipo", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText("Elegir paciente"));
    setHour("10:30");
    await user.click(screen.getByText("Elegir MAPA"));
    await user.click(screen.getByRole("button", { name: "Crear Sobreturno" }));

    await waitFor(() => expect(createOverturn).toHaveBeenCalledTimes(1));
    expect(createOverturn).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: 388,
        patientId: 501,
        date: "2026-11-20",
        hour: "10:30",
        consultationTypeId: 900,
      }),
    );
    // Los tipos se piden para el médico del sobreturno.
    expect(consultationTypeSelectDoctorIds).toContain(388);
  });

  it("sin tipo elegido no manda consultationTypeId (igual que hoy)", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText("Elegir paciente"));
    setHour("11:00");
    await user.click(screen.getByRole("button", { name: "Crear Sobreturno" }));

    await waitFor(() => expect(createOverturn).toHaveBeenCalledTimes(1));
    const payload = createOverturn.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("consultationTypeId");
    expect(payload).toMatchObject({ doctorId: 388, patientId: 501, hour: "11:00" });
  });

  it("el sobreturno de invitado también manda el tipo elegido", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText("Crear invitado"));
    await user.type(screen.getByLabelText("Nombre *"), "Emma");
    await user.type(screen.getByLabelText("Apellido *"), "Orazi");
    await user.type(screen.getByLabelText("Teléfono *"), "3411234567");
    setHour("12:00");
    await user.click(screen.getByText("Elegir MAPA"));
    await user.click(
      screen.getByRole("button", { name: "Crear Sobreturno Invitado" }),
    );

    await waitFor(() => expect(createGuestOverturn).toHaveBeenCalledTimes(1));
    expect(createGuestOverturn).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: 388,
        hour: "12:00",
        guestDocumentNumber: "30111222",
        consultationTypeId: 900,
      }),
    );
  });

  it("el sobreturno de invitado sin tipo no manda consultationTypeId", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByText("Crear invitado"));
    await user.type(screen.getByLabelText("Nombre *"), "Emma");
    await user.type(screen.getByLabelText("Apellido *"), "Orazi");
    await user.type(screen.getByLabelText("Teléfono *"), "3411234567");
    setHour("12:30");
    await user.click(
      screen.getByRole("button", { name: "Crear Sobreturno Invitado" }),
    );

    await waitFor(() => expect(createGuestOverturn).toHaveBeenCalledTimes(1));
    const payload = createGuestOverturn.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("consultationTypeId");
  });
});
