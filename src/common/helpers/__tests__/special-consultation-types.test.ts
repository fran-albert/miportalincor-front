import { describe, expect, it } from "vitest";
import {
  getSpecialConsultationTypeFromNames,
  getSpecialConsultationTypeInfo,
} from "@/common/helpers/special-consultation-types";

describe("getSpecialConsultationTypeInfo", () => {
  it("reconoce AMPA por su nombre corto y por el largo", () => {
    expect(getSpecialConsultationTypeInfo("AMPA")?.kind).toBe("AMPA");
    expect(
      getSpecialConsultationTypeInfo("AMPA - Automonitoreo de presión arterial")
        ?.kind,
    ).toBe("AMPA");
    expect(
      getSpecialConsultationTypeInfo("Automonitoreo de presión arterial")?.kind,
    ).toBe("AMPA");
  });

  it("no confunde AMPA con MAPA ni con Holter", () => {
    expect(getSpecialConsultationTypeInfo("MAPA")?.kind).toBe("MAPA");
    expect(
      getSpecialConsultationTypeInfo("Monitoreo ambulatorio de presión")?.kind,
    ).toBe("MAPA");
    expect(getSpecialConsultationTypeInfo("Holter")?.kind).toBe("HOLTER");
  });

  it("no pinta tipos que solo contienen las letras", () => {
    expect(getSpecialConsultationTypeInfo("Campaña de vacunación")).toBeNull();
    expect(getSpecialConsultationTypeInfo("Consulta")).toBeNull();
    expect(getSpecialConsultationTypeInfo(null)).toBeNull();
  });

  it("AMPA tiene un color distinto de MAPA y Holter", () => {
    const colors = ["AMPA", "MAPA", "Holter"].map(
      (name) => getSpecialConsultationTypeInfo(name)?.eventBorderColor,
    );
    expect(new Set(colors).size).toBe(3);
  });

  it("toma el primer tipo especial de una lista", () => {
    expect(
      getSpecialConsultationTypeFromNames(["Consulta", "AMPA"])?.kind,
    ).toBe("AMPA");
  });
});
