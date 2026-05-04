import { describe, expect, it } from "vitest";
import { Evolucion } from "@/types/Antecedentes/Antecedentes";
import {
  getDoctorDisplayName,
  getDoctorInitials,
  getDoctorSpecialities,
  getEvolutionData,
  getEvolutionDataTypeCategory,
  getEvolutionDataTypeName,
  getFechaConsultaFromEvolution,
  normalizeEvolutionDoctor,
} from "./evolutionSafeAccess";

describe("evolutionSafeAccess", () => {
  const importedEvolution = {
    id: "evolution-1",
    createdAt: "2026-05-04T12:00:00.000Z",
    updatedAt: "2026-05-04T12:00:00.000Z",
    deletedAt: null,
    doctor: null,
    data: [
      {
        id: "data-1",
        createdAt: "2026-05-04T12:00:00.000Z",
        updatedAt: "2026-05-04T12:00:00.000Z",
        deletedAt: null,
        value: "Texto importado desde SFS",
        observaciones: null,
        dataType: {
          id: "type-1",
          createdAt: "2026-05-04T12:00:00.000Z",
          updatedAt: "2026-05-04T12:00:00.000Z",
          deletedAt: null,
          name: "Evolución Importada (SFS)",
          category: "EVOLUCION",
        },
      },
    ],
  } as unknown as Evolucion;

  it("tolera evoluciones importadas sin médico registrado", () => {
    expect(getDoctorDisplayName(importedEvolution.doctor)).toBe(
      "Médico no registrado"
    );
    expect(getDoctorInitials(importedEvolution.doctor)).toBe("NR");
    expect(getDoctorSpecialities(importedEvolution.doctor)).toEqual([]);
    expect(normalizeEvolutionDoctor(importedEvolution.doctor)).toMatchObject({
      userId: 0,
      firstName: "",
      lastName: "",
      specialities: [],
    });
  });

  it("lee data y fecha sin romper si faltan estructuras opcionales", () => {
    expect(getEvolutionData(importedEvolution)).toHaveLength(1);
    expect(getEvolutionDataTypeName(importedEvolution.data![0])).toBe(
      "evolución importada (sfs)"
    );
    expect(getEvolutionDataTypeCategory(importedEvolution.data![0])).toBe(
      "EVOLUCION"
    );
    expect(getFechaConsultaFromEvolution(importedEvolution)).toBe(
      "2026-05-04T12:00:00.000Z"
    );

    expect(getEvolutionData({ ...importedEvolution, data: undefined })).toEqual(
      []
    );
  });
});
