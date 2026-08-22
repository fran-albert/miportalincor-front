import { describe, expect, it } from "vitest";
import {
  getConsultationTypeBadgeLabel,
  hasRemoteConsultationType,
} from "@/common/helpers/consultation-type-modality";

describe("getConsultationTypeBadgeLabel", () => {
  it("un turno de un solo estudio se rotula con ese estudio (no-regresión)", () => {
    expect(getConsultationTypeBadgeLabel(["Ergometría"])).toBe("Ergometría");
  });

  it("no rotula la modalidad, que ya se ve en el marcador", () => {
    expect(getConsultationTypeBadgeLabel(["Consulta Presencial"])).toBeNull();
    expect(getConsultationTypeBadgeLabel(["Consulta Remota"])).toBeNull();
    expect(getConsultationTypeBadgeLabel(["Teleconsulta"])).toBeNull();
    expect(getConsultationTypeBadgeLabel(["Consulta Virtual"])).toBeNull();
  });

  it("un turno sin estudios no tiene rótulo", () => {
    expect(getConsultationTypeBadgeLabel([])).toBeNull();
  });

  it("🔴 descarta la modalidad de a un tipo, sin tragarse los otros estudios", () => {
    expect(
      getConsultationTypeBadgeLabel([
        "Ergometría",
        "Consulta Presencial",
        "Electrocardiograma",
      ]),
    ).toBe("Ergometría · Electrocardiograma");
  });

  it("🔴 dos estudios se rotulan los dos", () => {
    expect(
      getConsultationTypeBadgeLabel([
        "Ecocardiograma Doppler Color",
        "Ergometría",
      ]),
    ).toBe("Ecocardiograma Doppler Color · Ergometría");
  });
});

describe("hasRemoteConsultationType", () => {
  it("un turno remoto se detecta como remoto (no-regresión)", () => {
    expect(hasRemoteConsultationType(["Consulta Remota"])).toBe(true);
    expect(hasRemoteConsultationType(["Teleconsulta"])).toBe(true);
    expect(hasRemoteConsultationType(["Consulta Virtual"])).toBe(true);
  });

  it("un turno presencial no es remoto", () => {
    expect(hasRemoteConsultationType(["Consulta Presencial"])).toBe(false);
    expect(hasRemoteConsultationType(["Ergometría"])).toBe(false);
    expect(hasRemoteConsultationType([])).toBe(false);
  });

  it("🔴 alcanza con que uno de los estudios del turno sea remoto", () => {
    expect(hasRemoteConsultationType(["Ergometría", "Teleconsulta"])).toBe(true);
  });
});
