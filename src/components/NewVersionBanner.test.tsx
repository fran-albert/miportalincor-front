// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewVersionBanner } from "./NewVersionBanner";

const respondWith = (version: string) =>
  vi.fn(async () => ({
    ok: true,
    json: async () => ({ version }),
  }));

const flush = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
};

// Caso de Andrea y Jenifer: con la pestaña abierta desde antes del deploy,
// seguían usando la versión vieja sin saberlo.
describe("NewVersionBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_APP_VERSION", "commit-viejo");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("avisa cuando el servidor publica otra versión", async () => {
    vi.stubGlobal("fetch", respondWith("commit-nuevo"));
    render(<NewVersionBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000);
    });

    expect(screen.getByText("Hay una versión nueva del portal")).toBeInTheDocument();
  });

  it("no avisa si la versión es la misma", async () => {
    const fetchMock = respondWith("commit-viejo");
    vi.stubGlobal("fetch", fetchMock);
    render(<NewVersionBanner />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("no avisa si no se puede consultar la versión", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("sin conexión");
    }));
    render(<NewVersionBanner />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("controla al volver a la pestaña, sin esperar los 5 minutos", async () => {
    vi.stubGlobal("fetch", respondWith("commit-nuevo"));
    render(<NewVersionBanner />);

    window.dispatchEvent(new Event("focus"));
    await flush();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("Actualizar recarga la página", async () => {
    vi.stubGlobal("fetch", respondWith("commit-nuevo"));
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    render(<NewVersionBanner />);

    window.dispatchEvent(new Event("focus"));
    await flush();
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("en desarrollo no consulta nada", async () => {
    vi.stubEnv("PROD", false);
    const fetchMock = respondWith("commit-nuevo");
    vi.stubGlobal("fetch", fetchMock);
    render(<NewVersionBanner />);

    window.dispatchEvent(new Event("focus"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5 * 60_000);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
