// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import DeactivateDoctorDialog from "./DeactivateDoctorDialog";
import type { DoctorPendingFuture } from "@/api/Appointments/get-doctor-pending-future.action";
import type { Doctor } from "@/types/Doctor/Doctor";

/**
 * Desactivar un médico (pliego "Autogestión de secretarias").
 *
 * La invariante: **con turnos futuros no se desactiva**. El front lo frena
 * antes de llamar, y si la API igual contesta 409 (otro turno entró en el
 * medio) se muestran los números del cuerpo, no un error genérico.
 */

const getPendingFuture = vi.fn<(doctorId: number) => Promise<DoctorPendingFuture>>();
const deactivateDoctor = vi.fn<(id: string) => Promise<Doctor>>();

vi.mock("@/api/Appointments/get-doctor-pending-future.action", () => ({
  getDoctorPendingFuture: (doctorId: number) => getPendingFuture(doctorId),
}));

vi.mock("@/api/Doctor/deactivate-doctor.action", () => ({
  deactivateDoctor: (id: string) => deactivateDoctor(id),
}));

vi.mock("@/api/Doctor/reactivate-doctor.action", () => ({
  reactivateDoctor: vi.fn(),
}));

vi.mock("@/api/Doctor/get-inactive-doctors.action", () => ({
  getInactiveDoctors: vi.fn(async () => []),
}));

const showSuccess = vi.fn();
const showError = vi.fn();
vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showSuccess, showError }),
}));

const axiosError = (status: number, data: unknown) => {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError("Request failed", String(status), config, undefined, {
    status,
    statusText: "",
    headers: {},
    config,
    data,
  });
};

const pending = (overrides: Partial<DoctorPendingFuture> = {}): DoctorPendingFuture => ({
  doctorId: 412,
  appointments: 0,
  overturns: 0,
  total: 0,
  nextDate: null,
  ...overrides,
});

const renderDialog = (props: { legacyUserId?: number } = { legacyUserId: 412 }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  render(
    <QueryClientProvider client={queryClient}>
      <DeactivateDoctorDialog
        doctorId="uuid-doc-412"
        legacyUserId={props.legacyUserId}
        doctorName="PRUEBA, MARTÍN"
      />
    </QueryClientProvider>,
  );
  return { invalidateSpy };
};

const openDialog = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Desactivar" }));
  const dialog = await screen.findByRole("dialog");
  return { user, dialog };
};

const confirmButton = (dialog: HTMLElement) =>
  within(dialog).getByRole("button", { name: "Desactivar" });

describe("DeactivateDoctorDialog", () => {
  beforeEach(() => {
    getPendingFuture.mockReset();
    deactivateDoctor.mockReset();
    showSuccess.mockReset();
    showError.mockReset();
  });

  it("no consulta turnos hasta que se abre el diálogo", () => {
    getPendingFuture.mockResolvedValue(pending());
    renderDialog();
    expect(getPendingFuture).not.toHaveBeenCalled();
  });

  it("con turnos pendientes muestra cuántos y el próximo, y no deja confirmar", async () => {
    getPendingFuture.mockResolvedValue(
      pending({ appointments: 3, overturns: 1, total: 4, nextDate: "2026-11-25" }),
    );
    renderDialog();
    const { dialog } = await openDialog();

    expect(
      await within(dialog).findByText(
        "Tiene 4 turnos pendientes (próximo: 25/11). Reprogramalos o cancelalos antes de desactivarlo.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Turnos: 3 · Sobreturnos: 1")).toBeInTheDocument();
    expect(getPendingFuture).toHaveBeenCalledWith(412);
    expect(confirmButton(dialog)).toBeDisabled();
    expect(
      within(dialog).queryByText(/No va a poder ingresar/),
    ).not.toBeInTheDocument();
  });

  it("con un solo turno pendiente lo dice en singular", async () => {
    getPendingFuture.mockResolvedValue(
      pending({ appointments: 0, overturns: 1, total: 1, nextDate: "2026-12-02T09:30:00.000Z" }),
    );
    renderDialog();
    const { dialog } = await openDialog();

    expect(
      await within(dialog).findByText(
        "Tiene 1 turno pendiente (próximo: 02/12). Reprogramalo o cancelalo antes de desactivarlo.",
      ),
    ).toBeInTheDocument();
    expect(confirmButton(dialog)).toBeDisabled();
  });

  it("sin turnos explica qué pasa y desactiva con un solo click", async () => {
    getPendingFuture.mockResolvedValue(pending());
    deactivateDoctor.mockResolvedValue({} as Doctor);
    const { invalidateSpy } = renderDialog();
    const { user, dialog } = await openDialog();

    expect(
      await within(dialog).findByText(
        "No va a poder ingresar ni aparecer en agendas ni listados. Su historia clínica y lo que cargó se siguen viendo.",
      ),
    ).toBeInTheDocument();
    // Es reversible: no hay que escribir nada para confirmar.
    expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
    expect(confirmButton(dialog)).toBeEnabled();

    await user.click(confirmButton(dialog));

    await waitFor(() => expect(deactivateDoctor).toHaveBeenCalledWith("uuid-doc-412"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(showSuccess).toHaveBeenCalledWith("Médico desactivado", expect.any(String));

    const invalidatedKeys = invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey);
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining([
        ["doctors"],
        ["doctors-search"],
        ["doctors-inactive"],
        ["doctorsWithAvailability"],
        ["doctorAgenda"],
      ]),
    );
  });

  it("si la API contesta 409 por un turno que entró en el medio, muestra los números del cuerpo", async () => {
    getPendingFuture.mockResolvedValue(pending());
    deactivateDoctor.mockRejectedValue(
      axiosError(409, {
        statusCode: 409,
        message: "El profesional tiene turnos pendientes",
        pendingAppointments: 2,
        pendingOverturns: 1,
        nextDate: "2026-11-21",
      }),
    );
    renderDialog();
    const { user, dialog } = await openDialog();

    await user.click(await within(dialog).findByRole("button", { name: "Desactivar" }));

    expect(
      await within(dialog).findByText(
        "Tiene 3 turnos pendientes (próximo: 21/11). Reprogramalos o cancelalos antes de desactivarlo.",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Turnos: 2 · Sobreturnos: 1")).toBeInTheDocument();
    expect(confirmButton(dialog)).toBeDisabled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(showError).not.toHaveBeenCalled();
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it("si la API contesta 503 avisa que no se pudo verificar", async () => {
    getPendingFuture.mockResolvedValue(pending());
    deactivateDoctor.mockRejectedValue(
      axiosError(503, { statusCode: 503, message: "Service Unavailable" }),
    );
    renderDialog();
    const { user, dialog } = await openDialog();

    await user.click(await within(dialog).findByRole("button", { name: "Desactivar" }));

    expect(
      await within(dialog).findByText(
        "No pudimos verificar los turnos del profesional. Probá de nuevo en un rato.",
      ),
    ).toBeInTheDocument();
    expect(confirmButton(dialog)).toBeDisabled();
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it("si falla la consulta de turnos pendientes no deja desactivar", async () => {
    getPendingFuture.mockRejectedValue(axiosError(503, {}));
    renderDialog();
    const { dialog } = await openDialog();

    expect(
      await within(dialog).findByText(
        "No pudimos verificar los turnos del profesional. Probá de nuevo en un rato.",
      ),
    ).toBeInTheDocument();
    expect(confirmButton(dialog)).toBeDisabled();
  });

  it("al cerrar y volver a abrir, olvida el 409 anterior y vuelve a consultar", async () => {
    getPendingFuture.mockResolvedValue(pending());
    deactivateDoctor.mockRejectedValueOnce(
      axiosError(409, {
        statusCode: 409,
        message: "",
        pendingAppointments: 1,
        pendingOverturns: 0,
        nextDate: null,
      }),
    );
    renderDialog();
    const { user, dialog } = await openDialog();
    await user.click(await within(dialog).findByRole("button", { name: "Desactivar" }));
    expect(
      await within(dialog).findByText(
        "Tiene 1 turno pendiente. Reprogramalo o cancelalo antes de desactivarlo.",
      ),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    const reopened = await openDialog();
    expect(
      await within(reopened.dialog).findByText(/No va a poder ingresar/),
    ).toBeInTheDocument();
    expect(getPendingFuture).toHaveBeenCalledTimes(2);
  });

  it("otros errores van al toast con el mensaje de la API", async () => {
    getPendingFuture.mockResolvedValue(pending());
    deactivateDoctor.mockRejectedValue(axiosError(403, { message: "Forbidden resource" }));
    renderDialog();
    const { user, dialog } = await openDialog();

    await user.click(await within(dialog).findByRole("button", { name: "Desactivar" }));

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("No se pudo desactivar", "Forbidden resource"),
    );
  });
});
