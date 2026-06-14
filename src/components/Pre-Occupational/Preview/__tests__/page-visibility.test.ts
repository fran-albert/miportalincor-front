import { describe, expect, it } from "vitest";
import { hasClinicalPageData } from "../page-visibility";

describe("hasClinicalPageData", () => {
  it("es false cuando no hay ningun dato clinico cargado", () => {
    expect(hasClinicalPageData({})).toBe(false);
    expect(
      hasClinicalPageData({
        aspectoGeneral: "   ",
        peso: "",
        talla: "",
        imc: "",
        agudezaSc: { right: "", left: "" },
        agudezaCc: { right: "", left: "" },
        visionCromatica: undefined,
        notasVision: "",
      })
    ).toBe(false);
  });

  it("es true si hay aspecto general", () => {
    expect(hasClinicalPageData({ aspectoGeneral: "Bueno" })).toBe(true);
  });

  it("es true si hay alguna medicion", () => {
    expect(hasClinicalPageData({ peso: "80" })).toBe(true);
    expect(hasClinicalPageData({ talla: "175" })).toBe(true);
    expect(hasClinicalPageData({ imc: "26" })).toBe(true);
  });

  it("es true si hay agudeza visual", () => {
    expect(
      hasClinicalPageData({ agudezaSc: { right: "10/10", left: "" } })
    ).toBe(true);
    expect(
      hasClinicalPageData({ agudezaCc: { right: "", left: "9/10" } })
    ).toBe(true);
  });

  it("es true si hay vision cromatica cargada", () => {
    expect(hasClinicalPageData({ visionCromatica: "normal" })).toBe(true);
    expect(hasClinicalPageData({ visionCromatica: "anormal" })).toBe(true);
  });

  it("es true si hay observaciones de vision", () => {
    expect(hasClinicalPageData({ notasVision: "usa lentes" })).toBe(true);
  });
});
