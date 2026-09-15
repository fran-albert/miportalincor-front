// @vitest-environment jsdom
import type { PropsWithChildren } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DoctorDashboardResponse } from "@/api/Doctor/get-my-dashboard.action";
import type { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";

const mockGetDoctorDashboardById = vi.hoisted(() => vi.fn());
const mockGetMyDashboard = vi.hoisted(() => vi.fn());

vi.mock("@/api/Doctor/get-my-dashboard.action", () => ({
  getDoctorDashboardById: mockGetDoctorDashboardById,
  getMyDashboard: mockGetMyDashboard,
}));

import { useDoctorDashboard } from "./useDoctorDashboard";

const dashboard = (appointmentId: number): DoctorDashboardResponse => ({
  doctor: {} as DoctorDashboardResponse["doctor"],
  bookingSettings: null,
  holidays: [],
  availability: [],
  absences: [],
  todayAppointments: [],
  todayOverturns: [],
  calendarAppointments: [
    { id: appointmentId } as AppointmentFullResponseDto,
  ],
  calendarOverturns: [],
  slotsRange: {},
  blockedSlots: [],
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe("useDoctorDashboard", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("keeps the previous agenda visible while a new date range loads", async () => {
    let resolveNext!: (value: DoctorDashboardResponse) => void;
    mockGetDoctorDashboardById
      .mockResolvedValueOnce(dashboard(1))
      .mockImplementationOnce(
        () =>
          new Promise<DoctorDashboardResponse>((resolve) => {
            resolveNext = resolve;
          }),
      );
    const { wrapper } = createWrapper();
    const { result, rerender } = renderHook(
      ({ dateFrom, dateTo }) =>
        useDoctorDashboard({
          doctorId: 42,
          dateFrom,
          dateTo,
          selectedWeekStart: dateFrom,
          selectedWeekEnd: dateTo,
        }),
      {
        wrapper,
        initialProps: {
          dateFrom: "2026-09-14",
          dateTo: "2026-09-20",
        },
      },
    );

    await waitFor(() => expect(result.current.appointments[0]?.id).toBe(1));

    rerender({ dateFrom: "2026-09-21", dateTo: "2026-09-27" });

    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.appointments[0]?.id).toBe(1);
    expect(result.current.isLoading).toBe(false);

    await act(async () => resolveNext(dashboard(2)));
    await waitFor(() => expect(result.current.appointments[0]?.id).toBe(2));
  });

  it("does not carry placeholder data across doctors", async () => {
    mockGetDoctorDashboardById
      .mockResolvedValueOnce(dashboard(1))
      .mockImplementationOnce(() => new Promise<DoctorDashboardResponse>(() => undefined));
    const { wrapper } = createWrapper();
    const { result, rerender } = renderHook(
      ({ doctorId }) =>
        useDoctorDashboard({
          doctorId,
          dateFrom: "2026-09-14",
          dateTo: "2026-09-20",
          selectedWeekStart: "2026-09-14",
          selectedWeekEnd: "2026-09-20",
        }),
      { wrapper, initialProps: { doctorId: 42 } },
    );

    await waitFor(() => expect(result.current.appointments[0]?.id).toBe(1));
    rerender({ doctorId: 84 });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.appointments).toEqual([]);
  });

  it("aborts the obsolete query and supplies its signal to the API", async () => {
    const signals: AbortSignal[] = [];
    mockGetDoctorDashboardById.mockImplementation(
      (
        _doctorId: number,
        _params: unknown,
        signal: AbortSignal,
      ) => {
        signals.push(signal);
        return new Promise<DoctorDashboardResponse>((_resolve, reject) => {
          signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      },
    );
    const { wrapper } = createWrapper();
    const { rerender } = renderHook(
      ({ dateFrom, dateTo }) =>
        useDoctorDashboard({
          doctorId: 42,
          dateFrom,
          dateTo,
          selectedWeekStart: dateFrom,
          selectedWeekEnd: dateTo,
        }),
      {
        wrapper,
        initialProps: {
          dateFrom: "2026-09-14",
          dateTo: "2026-09-20",
        },
      },
    );

    await waitFor(() => expect(signals).toHaveLength(1));
    expect(signals[0].aborted).toBe(false);

    rerender({ dateFrom: "2026-09-21", dateTo: "2026-09-27" });

    await waitFor(() => expect(signals).toHaveLength(2));
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });
});
