import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadReportVisibilityOverrides,
  saveReportVisibilityOverrides,
} from "./report-visibility.storage";

describe("report visibility storage", () => {
  beforeEach(() => {
    const storageMock = (() => {
      const store = new Map<string, string>();

      return {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
        clear: () => store.clear(),
      };
    })();

    vi.stubGlobal("window", {
      localStorage: storageMock,
    });
  });

  it("guarda y recupera overrides válidos por examen", () => {
    saveReportVisibilityOverrides(14, {
      genitourinary_gyn_ob: "force_hide",
    });

    expect(loadReportVisibilityOverrides(14)).toEqual({
      genitourinary_gyn_ob: "force_hide",
    });
  });

  it("ignora claves o modos inválidos al recuperar", () => {
    window.localStorage.setItem(
      "preoccupational-report-visibility:22",
      JSON.stringify({
        genitourinary_gyn_ob: "force_show",
        invalid_section: "force_hide",
        genitourinary: "bogus_mode",
      })
    );

    expect(loadReportVisibilityOverrides(22)).toEqual({
      genitourinary_gyn_ob: "force_show",
    });
  });
});
