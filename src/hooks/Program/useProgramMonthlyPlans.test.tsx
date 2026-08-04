// @vitest-environment jsdom
import { PropsWithChildren } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProgramMonthlyWhatsappStatus } from "@/types/Program/ProgramMonthlyPlan";

const mockUpsert = vi.hoisted(() => vi.fn());

vi.mock("@/api/Program/program-monthly-plans.actions", () => ({
  getProgramMonthlyPlan: vi.fn(),
  getProgramMonthlyPlans: vi.fn(),
  sendProgramMonthlyPlanWhatsapp: vi.fn(),
  upsertProgramMonthlyPlan: mockUpsert,
}));

import {
  programMonthlyPlanQueryKey,
  programMonthlyPlansQueryKey,
  useProgramMonthlyPlanMutations,
} from "./useProgramMonthlyPlans";

describe("useProgramMonthlyPlanMutations", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("reemplaza el cálculo provisional por la respuesta del backend", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const queryKey = programMonthlyPlanQueryKey("enrollment-1", 2026, 7);
    const historyQueryKey = programMonthlyPlansQueryKey("enrollment-1");
    queryClient.setQueryData(queryKey, {
      discountedTotalCents: "99999999",
    });
    queryClient.setQueryData(historyQueryKey, []);
    const backendResponse = {
      persisted: true,
      enrollmentId: "enrollment-1",
      periodYear: 2026,
      periodMonth: 7,
      programMonthNumber: 1,
      programName: "Programa",
      discountBasisPoints: 1000,
      discountPercent: 10,
      listTotalCents: "12500000",
      discountAmountCents: "1250000",
      discountedTotalCents: "11250000",
      revision: 1,
      whatsappStatus: ProgramMonthlyWhatsappStatus.DISABLED,
      activities: [],
    };
    mockUpsert.mockResolvedValue(backendResponse);
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () => useProgramMonthlyPlanMutations("enrollment-1"),
      { wrapper }
    );

    await act(async () => {
      await result.current.saveMutation.mutateAsync({
        year: 2026,
        month: 7,
        dto: { activities: [] },
      });
    });

    expect(queryClient.getQueryData(queryKey)).toEqual(backendResponse);
    expect(
      queryClient.getQueryState(historyQueryKey)?.isInvalidated
    ).toBe(true);
  });
});
