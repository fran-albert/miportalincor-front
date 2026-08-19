import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CreateAppointmentForm } from "./CreateAppointmentForm";

/**
 * Pantalla y payload dicen lo mismo sobre la paciente.
 *
 * 🔴 El bug: cambiar de modalidad y volver **desmonta y remonta** todo lo que
 * va debajo del médico. El buscador de padrón mostraba lo que encontró en su
 * propia búsqueda —estado local—, así que al remontar volvía al placeholder;
 * pero `patientId` vive en react-hook-form y NO se desmonta. Resultado: la
 * secretaria leía *"Buscar paciente por DNI…"* y el turno se creaba igual para
 * la paciente de antes. En el peor caso buscaba otra, no la encontraba, y el
 * turno quedaba para la primera.
 *
 * La invariante que protegen estos tests: **lo que muestra el campo sale del
 * valor del formulario**. Si el formulario tiene una paciente, se la ve; si no
 * tiene ninguna, se ve el placeholder. Nunca una cosa distinta de la otra.
 */

// jsdom no implementa `scrollIntoView` y cmdk lo llama al reabrir la lista.
Element.prototype.scrollIntoView = vi.fn();

vi.mock("@/hooks/Doctor/useDoctors", () => ({
  useDoctors: () => ({
    doctors: [
      { userId: 388, firstName: "Victoria", lastName: "Tudela", specialities: [] },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/ConsultationType", () => ({
  useConsultationTypes: () => ({ consultationTypes: [] }),
}));

vi.mock("../Select/DoctorSelect", () => ({
  DoctorSelect: ({ onValueChange }: { onValueChange: (id: number) => void }) => (
    <button type="button" onClick={() => onValueChange(388)}>
      Elegir médico
    </button>
  ),
}));

vi.mock("../Select/ConsultationTypesMultiSelect", () => ({
  ConsultationTypesMultiSelect: ({
    onValueChange,
  }: {
    onValueChange: (ids: number[]) => void;
  }) => (
    <button type="button" onClick={() => onValueChange([4])}>
      Elegir tipo
    </button>
  ),
}));

vi.mock("../Select/TimeSlotSelect", () => ({
  TimeSlotSelect: ({ onValueChange }: { onValueChange?: (h: string) => void }) => (
    <button
      type="button"
      data-testid="selector-de-hora"
      onClick={() => onValueChange?.("11:00")}
    >
      Elegir las 11:00
    </button>
  ),
}));

/** El padrón, tal como lo contesta el backend cuando se busca por DNI. */
vi.mock("@/api/Patient/search-patients.action", () => ({
  searchPatients: vi.fn().mockResolvedValue({
    data: [
      {
        userId: 501,
        firstName: "Ana",
        lastName: "Pérez",
        userName: "30111222",
        healthPlans: [],
      },
      {
        userId: 777,
        firstName: "Beatriz",
        lastName: "Molina",
        userName: "30111999",
        healthPlans: [],
      },
    ],
    total: 2,
    page: 1,
    limit: 10,
  }),
}));

/**
 * El diálogo real: el que decide si debajo del médico va el alta común o el
 * recorrido del control. Acá se lo reduce a un botón que alterna.
 */
const Host = ({ onSubmit }: { onSubmit: (data: unknown) => Promise<void> }) => {
  const [enOtraModalidad, setEnOtraModalidad] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setEnOtraModalidad((v) => !v)}>
        Alternar modalidad
      </button>
      <CreateAppointmentForm
        onSubmit={onSubmit as never}
        defaultDoctorId={388}
        fieldsBelowDoctorOverride={
          enOtraModalidad ? <div>recorrido del control</div> : undefined
        }
      />
    </>
  );
};

const renderHost = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={client}>
      <Host onSubmit={onSubmit} />
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), onSubmit };
};

const buscarYElegir = async (
  user: ReturnType<typeof userEvent.setup>,
  nombre: RegExp,
) => {
  await user.click(screen.getByRole("combobox"));
  const buscador = screen.getByPlaceholderText("Buscar por DNI...");
  if (!(buscador as HTMLInputElement).value) {
    await user.type(buscador, "301112");
  }
  await user.click(await screen.findByText(nombre, {}, { timeout: 3000 }));
  await waitFor(() =>
    expect(screen.getByRole("combobox")).toHaveTextContent(nombre),
  );
};

const elegirAnaPerez = (user: ReturnType<typeof userEvent.setup>) =>
  buscarYElegir(user, /Ana Pérez/);

const alternarModalidadIdaYVuelta = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(screen.getByRole("button", { name: /alternar modalidad/i }));
  await user.click(screen.getByRole("button", { name: /alternar modalidad/i }));
};

describe("CreateAppointmentForm · la paciente elegida y la pantalla", () => {
  it("después de ir y volver de la modalidad, la paciente sigue en pantalla", async () => {
    const { user } = renderHost();

    await elegirAnaPerez(user);
    await alternarModalidadIdaYVuelta(user);

    expect(screen.getByRole("combobox")).toHaveTextContent("Ana Pérez");
    expect(screen.getByRole("combobox")).not.toHaveTextContent(
      "Buscar paciente por DNI...",
    );
  });

  it("y el turno se crea para esa misma paciente: pantalla y payload coinciden", async () => {
    const { user, onSubmit } = renderHost();

    await elegirAnaPerez(user);
    await alternarModalidadIdaYVuelta(user);
    await user.click(screen.getByRole("button", { name: /elegir tipo/i }));
    await user.click(screen.getByTestId("selector-de-hora"));
    await user.click(screen.getByRole("button", { name: "Crear Turno" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: 501 }),
        expect.anything(),
      ),
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Ana Pérez");
  });

  /**
   * La otra mitad de la invariante: sin paciente en el formulario, el campo
   * dice el placeholder. Un nombre "pegado" de una elección anterior sería el
   * mismo bug al revés.
   */
  it("sin paciente elegida, el campo dice el placeholder", () => {
    renderHost();

    expect(screen.getByRole("combobox")).toHaveTextContent(
      "Buscar paciente por DNI...",
    );
  });
});

/**
 * No-regresión del alta de todos los días.
 *
 * 🔴 Este formulario es el que la secretaria usa todo el tiempo: el control
 * integral está injertado acá, y cualquier cosa que se le rompa al alta común
 * es lo más caro que se puede romper. Estos tests no hablan del control.
 */
describe("CreateAppointmentForm · no-regresión del alta común", () => {
  it("el alta de siempre crea el turno con la paciente que se eligió", async () => {
    const { user, onSubmit } = renderHost();

    await elegirAnaPerez(user);
    await user.click(screen.getByRole("button", { name: /elegir tipo/i }));
    await user.click(screen.getByTestId("selector-de-hora"));
    await user.click(screen.getByRole("button", { name: "Crear Turno" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 501,
          doctorId: 388,
          hour: "11:00",
          consultationTypeIds: [4],
        }),
        expect.anything(),
      ),
    );
  });

  it("cambiar de paciente pisa a la anterior, en pantalla y en el payload", async () => {
    const { user, onSubmit } = renderHost();

    await elegirAnaPerez(user);
    await buscarYElegir(user, /Beatriz Molina/);

    expect(screen.getByRole("combobox")).not.toHaveTextContent("Ana Pérez");

    await user.click(screen.getByRole("button", { name: /elegir tipo/i }));
    await user.click(screen.getByTestId("selector-de-hora"));
    await user.click(screen.getByRole("button", { name: "Crear Turno" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ patientId: 777 }),
        expect.anything(),
      ),
    );
  });

  it("con la paciente fijada de antemano, el campo la muestra y no se toca", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
      <QueryClientProvider client={client}>
        <CreateAppointmentForm
          onSubmit={vi.fn().mockResolvedValue(undefined)}
          defaultDoctorId={388}
          defaultPatient={{
            userId: 900,
            firstName: "Carla",
            lastName: "Suárez",
            userName: "28999111",
          }}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Carla Suárez");
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
