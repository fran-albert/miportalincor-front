// @vitest-environment jsdom
import type { PropsWithChildren } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockUpdatePatient = vi.hoisted(() => vi.fn());

vi.mock("@/api/Patient/update-patient.action", () => ({
  updatePatient: mockUpdatePatient,
}));

import { usePatientMutations } from "./usePatientMutation";

describe("usePatientMutations - updatePatientMutation", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("después de corregir el DNI refresca la ficha abierta por userId del slug", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    // El perfil se cachea con el userId numérico del slug, no con el UUID.
    queryClient.setQueryData(["patient", "1014"], { userName: "25000001" });
    mockUpdatePatient.mockResolvedValue({ userName: "25000002" });

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => usePatientMutations(), { wrapper });

    await act(async () => {
      await result.current.updatePatientMutation.mutateAsync({
        id: "00000000-0000-0000-0000-000000000014",
        patient: { userName: "25000002" },
      });
    });

    expect(queryClient.getQueryState(["patient", "1014"])?.isInvalidated).toBe(
      true,
    );
  });
});
