// @vitest-environment jsdom
import type { PropsWithChildren } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockGetAvailableSlotsRange = vi.hoisted(() => vi.fn());

vi.mock("@/api/Appointments", () => ({
  getAvailableSlotsRange: mockGetAvailableSlotsRange,
}));

import { useFirstAvailableDate } from "./useFirstAvailableDate";

describe("useFirstAvailableDate", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not issue automatic month searches when secretary changes doctor", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { rerender } = renderHook(
      ({ doctorId }) =>
        useFirstAvailableDate({ doctorId, maxMonthsAhead: 6, enabled: false }),
      { wrapper, initialProps: { doctorId: 42 } },
    );

    rerender({ doctorId: 84 });
    await act(async () => Promise.resolve());

    expect(mockGetAvailableSlotsRange).not.toHaveBeenCalled();
  });
});
