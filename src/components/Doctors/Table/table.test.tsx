// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { DoctorsTable } from "./table";
import type { Doctor } from "@/types/Doctor/Doctor";

/**
 * Listado de médicos: "Desactivar" y "Ver desactivados" son de secretaría y
 * administración. El médico solo consulta.
 */

const roles = { isSecretary: false, isDoctor: false, isAdmin: false };
vi.mock("@/hooks/useRoles", () => ({
  default: () => roles,
}));

const getInactiveDoctors = vi.fn<() => Promise<Doctor[]>>();
const reactivateDoctor = vi.fn<(id: string) => Promise<Doctor>>();

vi.mock("@/api/Doctor/get-inactive-doctors.action", () => ({
  getInactiveDoctors: () => getInactiveDoctors(),
}));
vi.mock("@/api/Doctor/reactivate-doctor.action", () => ({
  reactivateDoctor: (id: string) => reactivateDoctor(id),
}));
vi.mock("@/api/Doctor/deactivate-doctor.action", () => ({
  deactivateDoctor: vi.fn(),
}));
vi.mock("@/api/Appointments/get-doctor-pending-future.action", () => ({
  getDoctorPendingFuture: vi.fn(async () => ({
    doctorId: 0,
    appointments: 0,
    overturns: 0,
    total: 0,
    nextDate: null,
  })),
}));

const showSuccess = vi.fn();
const showError = vi.fn();
vi.mock("@/hooks/Toast/toast-context", () => ({
  useToastContext: () => ({ showSuccess, showError }),
}));

const buildDoctor = (overrides: Partial<Doctor>): Doctor =>
  ({
    id: "uuid-1",
    userId: 1,
    firstName: "Ana",
    lastName: "Prueba",
    userName: "30111222",
    dni: "30111222",
    email: "ana@prueba.test",
    matricula: "1234",
    specialities: [],
    healthInsurances: [],
    slug: "ana-prueba-1",
    ...overrides,
  }) as Doctor;

const ACTIVE = [buildDoctor({ id: "uuid-10", userId: 10, firstName: "Martín", lastName: "Activo" })];
const INACTIVE = [
  buildDoctor({ id: "uuid-20", userId: 20, firstName: "Carlos", lastName: "Desactivado" }),
];

const renderTable = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DoctorsTable doctors={ACTIVE} prefetchDoctors={vi.fn()} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("DoctorsTable — desactivar y reactivar", () => {
  beforeEach(() => {
    Object.assign(roles, { isSecretary: false, isDoctor: false, isAdmin: false });
    getInactiveDoctors.mockReset().mockResolvedValue(INACTIVE);
    reactivateDoctor.mockReset().mockResolvedValue(INACTIVE[0]);
    showSuccess.mockReset();
    showError.mockReset();
  });

  it("el médico no ve Desactivar ni Ver desactivados", () => {
    roles.isDoctor = true;
    renderTable();

    expect(screen.getByText("Activo, Martín")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Desactivar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Ver desactivados")).not.toBeInTheDocument();
    expect(getInactiveDoctors).not.toHaveBeenCalled();
  });

  it.each([
    ["secretaria", { isSecretary: true }],
    ["administrador", { isAdmin: true }],
  ])("la %s ve Desactivar (y no Eliminar) en cada médico", (_, role) => {
    Object.assign(roles, role);
    renderTable();

    const row = screen.getByRole("row", { name: /Activo, Martín/ });
    expect(within(row).getByRole("button", { name: "Desactivar" })).toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Ver desactivados")).toBeInTheDocument();
  });

  it("Ver desactivados lista los desactivados y Reactivar pide confirmación y llama a la API", async () => {
    roles.isSecretary = true;
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByLabelText("Ver desactivados"));

    expect(await screen.findByText("Desactivado, Carlos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Médicos desactivados" })).toBeInTheDocument();
    expect(screen.queryByText("Activo, Martín")).not.toBeInTheDocument();

    const row = screen.getByRole("row", { name: /Desactivado, Carlos/ });
    await user.click(within(row).getByRole("button", { name: "Reactivar" }));

    const confirm = await screen.findByRole("alertdialog");
    expect(within(confirm).getByText(/va a poder ingresar/)).toBeInTheDocument();
    expect(reactivateDoctor).not.toHaveBeenCalled();

    // Al reactivar, el listado de desactivados se vuelve a pedir.
    getInactiveDoctors.mockResolvedValue([]);
    await user.click(within(confirm).getByRole("button", { name: "Reactivar" }));

    await waitFor(() => expect(reactivateDoctor).toHaveBeenCalledWith("uuid-20"));
    expect(await screen.findByText("No hay médicos desactivados.")).toBeInTheDocument();
    expect(getInactiveDoctors).toHaveBeenCalledTimes(2);
    expect(showSuccess).toHaveBeenCalledWith("Médico reactivado", expect.any(String));
  });

  it("cancelar la reactivación no llama a la API", async () => {
    roles.isAdmin = true;
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByLabelText("Ver desactivados"));
    const row = await screen.findByRole("row", { name: /Desactivado, Carlos/ });
    await user.click(within(row).getByRole("button", { name: "Reactivar" }));
    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(reactivateDoctor).not.toHaveBeenCalled();
  });

  it("si no hay desactivados lo dice", async () => {
    roles.isSecretary = true;
    getInactiveDoctors.mockResolvedValue([]);
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByLabelText("Ver desactivados"));
    expect(await screen.findByText("No hay médicos desactivados.")).toBeInTheDocument();
  });

  it("al apagar Ver desactivados vuelve al listado activo", async () => {
    roles.isSecretary = true;
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByLabelText("Ver desactivados"));
    await screen.findByText("Desactivado, Carlos");
    await user.click(screen.getByLabelText("Ver desactivados"));

    expect(screen.getByText("Activo, Martín")).toBeInTheDocument();
    expect(screen.queryByText("Desactivado, Carlos")).not.toBeInTheDocument();
  });
});
