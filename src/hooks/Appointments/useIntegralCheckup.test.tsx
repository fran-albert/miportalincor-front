import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAppointmentMutations } from "./useAppointmentMutations";
import { useCreateStaffIntegralAppointment } from "./useIntegralCheckup";

/**
 * Lo que queda viejo después de dar un turno.
 *
 * 🔴 El control **es** un alta de turnos: ocupa dos casilleros reales de dos
 * agendas. Si el alta común refresca la cola del día y los listados de la
 * paciente y el control no, la secretaria da un control **para hoy** y la cola
 * de recepción sigue mostrando el día de antes. La lista del control no puede
 * ser un subconjunto de la del alta común: tiene que invalidar todo lo que
 * invalida ella, más lo suyo.
 */

vi.mock("@/api/Appointments", () => ({
  createAppointment: vi.fn().mockResolvedValue({ id: 1 }),
  updateAppointment: vi.fn(),
  changeAppointmentStatus: vi.fn(),
  deleteAppointment: vi.fn(),
  rescheduleAppointment: vi.fn(),
}));

vi.mock("@/api/Appointments/integral-checkup.action", () => ({
  createStaffIntegralAppointment: vi
    .fn()
    .mockResolvedValue({ consultation: { id: 1 }, ultrasound: { id: 2 } }),
  getIntegralAvailableDays: vi.fn(),
  getIntegralCheckupConfig: vi.fn(),
  getStaffIntegralAvailableDays: vi.fn(),
  requestIntegralAppointment: vi.fn(),
  setIntegralUltrasoundTypes: vi.fn(),
}));

/** Qué claves invalidó una mutación, en el orden en que las pidió. */
const clavesInvalidadasPor = async (
  correr: (client: QueryClient) => Promise<void>,
): Promise<string[]> => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const claves: string[] = [];
  vi.spyOn(client, "invalidateQueries").mockImplementation((filters) => {
    const key = (filters?.queryKey ?? []) as unknown[];
    claves.push(String(key[0]));
    return Promise.resolve();
  });
  await correr(client);
  return claves;
};

const wrapper =
  (client: QueryClient) =>
  ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

const clavesDelAltaComun = () =>
  clavesInvalidadasPor(async (client) => {
    const { result } = renderHook(() => useAppointmentMutations(), {
      wrapper: wrapper(client),
    });
    await result.current.createAppointment.mutateAsync({
      doctorId: 388,
      patientId: 501,
      date: "2027-03-10",
      hour: "11:00",
      consultationTypeIds: [4],
    });
    await waitFor(() =>
      expect(result.current.createAppointment.isSuccess).toBe(true),
    );
  });

const clavesDelControl = () =>
  clavesInvalidadasPor(async (client) => {
    const { result } = renderHook(() => useCreateStaffIntegralAppointment(), {
      wrapper: wrapper(client),
    });
    await result.current.mutateAsync({ patientId: 501, date: "2027-03-10" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

describe("useCreateStaffIntegralAppointment · qué refresca", () => {
  it("invalida todo lo que invalida el alta común de turnos", async () => {
    const comun = await clavesDelAltaComun();
    const control = await clavesDelControl();

    expect(comun.length).toBeGreaterThan(0);
    expect(control).toEqual(expect.arrayContaining(comun));
  });

  it("y además los listados propios del control", async () => {
    const control = await clavesDelControl();

    expect(control).toEqual(
      expect.arrayContaining([
        "staffIntegralAvailableDays",
        "integralAvailableDays",
      ]),
    );
  });
});
