import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CreateAppointmentForm } from "./CreateAppointmentForm";

/**
 * El seam que hace posible el recorrido que pidió Francisco: **primero el
 * médico, y recién debajo la modalidad**.
 *
 * El alta de turnos es una sola y sigue siendo la de siempre; lo único que
 * suma es (1) avisar hacia arriba qué médico se eligió y (2) dejar un lugar
 * justo debajo del médico donde el diálogo mete el selector de modalidad y,
 * si se elige el control, el recorrido del control.
 *
 * Los selectores son los que ya usa el alta común y tienen sus propios tests:
 * acá se reemplazan por marcadores para que el test hable de lo que se agregó.
 */

vi.mock("../Select/DoctorSelect", () => ({
  DoctorSelect: ({
    onValueChange,
  }: {
    onValueChange: (doctorId: number | undefined) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onValueChange(388)}>
        Elegir a la ginecóloga
      </button>
      <button type="button" onClick={() => onValueChange(12)}>
        Elegir a otro médico
      </button>
    </div>
  ),
}));

vi.mock("../Select/PatientSelectWithGuestOption", () => ({
  PatientSelectWithGuestOption: () => <div data-testid="paciente-comun" />,
}));

vi.mock("../Select/TimeSlotSelect", () => ({
  TimeSlotSelect: () => <div data-testid="horario-comun" />,
}));

vi.mock("../Select/ConsultationTypesMultiSelect", () => ({
  ConsultationTypesMultiSelect: () => <div data-testid="tipos-comunes" />,
}));

vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: () => <div data-testid="fecha-comun" />,
}));

vi.mock("@/hooks/Doctor/useDoctors", () => ({
  useDoctors: () => ({ doctors: [], isLoading: false }),
}));

vi.mock("@/hooks/ConsultationType", () => ({
  useConsultationTypes: () => ({ consultationTypes: [] }),
}));

describe("CreateAppointmentForm · la entrada del control integral", () => {
  const renderForm = (props: Partial<Parameters<typeof CreateAppointmentForm>[0]> = {}) =>
    render(
      <CreateAppointmentForm
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        {...props}
      />,
    );

  it("avisa qué médico eligió la secretaria", async () => {
    const onDoctorChange = vi.fn();
    renderForm({ onDoctorChange });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));

    await waitFor(() => expect(onDoctorChange).toHaveBeenCalledWith(388));
  });

  it("y avisa también cuando cambia de médico", async () => {
    const onDoctorChange = vi.fn();
    renderForm({ onDoctorChange });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /la ginecóloga/i }));
    await user.click(screen.getByRole("button", { name: /otro médico/i }));

    await waitFor(() => expect(onDoctorChange).toHaveBeenLastCalledWith(12));
  });

  it("pone lo que le den justo DEBAJO del médico y ARRIBA del paciente", () => {
    const { container } = renderForm({
      afterDoctorField: <div data-testid="modalidad" />,
    });

    const orden = Array.from(
      container.querySelectorAll(
        '[data-testid="modalidad"], [data-testid="paciente-comun"]',
      ),
    ).map((node) => node.getAttribute("data-testid"));

    expect(orden).toEqual(["modalidad", "paciente-comun"]);
  });

  it("sin ese nodo el alta común no cambia en nada", () => {
    renderForm();

    expect(screen.queryByTestId("modalidad")).not.toBeInTheDocument();
    expect(screen.getByTestId("paciente-comun")).toBeInTheDocument();
    expect(screen.getByTestId("fecha-comun")).toBeInTheDocument();
    expect(screen.getByTestId("tipos-comunes")).toBeInTheDocument();
    expect(screen.getByTestId("horario-comun")).toBeInTheDocument();
  });

  it("cuando le dan otro recorrido, el médico queda y el resto del alta común se va", () => {
    renderForm({
      afterDoctorField: <div data-testid="modalidad" />,
      fieldsBelowDoctorOverride: <div data-testid="recorrido-del-control" />,
    });

    // El médico y la modalidad siguen arriba: la secretaria puede cambiar de
    // idea sin cerrar el diálogo.
    expect(screen.getByRole("button", { name: /la ginecóloga/i })).toBeInTheDocument();
    expect(screen.getByTestId("modalidad")).toBeInTheDocument();
    expect(screen.getByTestId("recorrido-del-control")).toBeInTheDocument();

    // Y los campos del turno común no quedan escondidos debajo: no están.
    expect(screen.queryByTestId("paciente-comun")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fecha-comun")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tipos-comunes")).not.toBeInTheDocument();
    expect(screen.queryByTestId("horario-comun")).not.toBeInTheDocument();
  });

  it("con otro recorrido puesto, el alta común no se puede disparar", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const formRef = { current: null as HTMLFormElement | null };
    renderForm({
      onSubmit,
      formRef,
      fieldsBelowDoctorOverride: <div data-testid="recorrido-del-control" />,
    });

    formRef.current?.requestSubmit();

    // Un Enter perdido en el recorrido del control no puede crear un turno
    // común con los campos que ya no están en pantalla.
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
  });
});
