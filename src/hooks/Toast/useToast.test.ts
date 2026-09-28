// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useToast } from "./useToast";

describe("useToast.promiseToast", () => {
  it("success puede calcularse con el resultado de la promesa", async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      await result.current.promiseToast(Promise.resolve({ reset: true }), {
        loading: { title: "Guardando" },
        success: (saved) => ({
          title: "Guardado",
          description: saved.reset ? "con reseteo" : "sin reseteo",
        }),
        error: { title: "Error" },
      });
    });

    expect(result.current.toasts).toEqual([
      expect.objectContaining({
        type: "success",
        title: "Guardado",
        description: "con reseteo",
      }),
    ]);
  });

  it("success fijo sigue funcionando", async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      await result.current.promiseToast(Promise.resolve(1), {
        loading: { title: "Guardando" },
        success: { title: "Listo", description: "ok" },
        error: { title: "Error" },
      });
    });

    expect(result.current.toasts).toEqual([
      expect.objectContaining({ type: "success", title: "Listo", description: "ok" }),
    ]);
  });
});
