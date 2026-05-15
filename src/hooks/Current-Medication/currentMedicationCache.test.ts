import { describe, expect, it } from "vitest";
import { MedicationStatus } from "@/types/Current-Medication/Current-Medication";
import type { CurrentMedication } from "@/types/Current-Medication/Current-Medication";
import {
  isHistoriaCurrentMedicationQueryKey,
  reconcileCurrentMedicationList,
  reconcileCurrentMedicationQueryData,
  removeCurrentMedicationQueryData,
} from "./currentMedicationCache";

const buildMedication = (
  overrides: Partial<CurrentMedication>
): CurrentMedication => ({
  id: overrides.id ?? 1,
  createdAt: overrides.createdAt ?? "2026-05-15T10:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-05-15T10:00:00.000Z",
  deletedAt: overrides.deletedAt ?? "",
  idUserHistoriaClinica: overrides.idUserHistoriaClinica ?? "hc-1",
  idDoctor: overrides.idDoctor ?? "doctor-1",
  startDate: overrides.startDate ?? "2026-05-15",
  status: overrides.status ?? MedicationStatus.ACTIVE,
  observations: overrides.observations ?? "Texto anterior",
  doctor: overrides.doctor,
});

const activeQueryKey = [
  "historia-clinica",
  758,
  "medicacion-actual",
  { status: "ACTIVE", includeDoctor: true },
] as const;

describe("currentMedicationCache", () => {
  it("reemplaza la medicacion existente preservando doctor si la respuesta no lo trae", () => {
    const cachedMedication = buildMedication({
      observations: "Texto anterior",
      doctor: { userId: "doctor-1", firstName: "Ana", lastName: "Salgado" },
    });
    const savedMedication = buildMedication({
      observations: "Texto nuevo",
      doctor: undefined,
    });

    const result = reconcileCurrentMedicationList(
      [cachedMedication],
      savedMedication,
      activeQueryKey,
      "replace"
    );

    expect(result).toHaveLength(1);
    expect(result[0].observations).toBe("Texto nuevo");
    expect(result[0].doctor).toEqual({
      userId: "doctor-1",
      firstName: "Ana",
      lastName: "Salgado",
    });
  });

  it("remueve de una cache ACTIVE si la medicacion queda suspendida", () => {
    const cachedMedication = buildMedication({ id: 7 });
    const suspendedMedication = buildMedication({
      id: 7,
      status: MedicationStatus.SUSPENDED,
      observations: "Suspendida",
    });

    const result = reconcileCurrentMedicationList(
      [cachedMedication],
      suspendedMedication,
      activeQueryKey,
      "replace"
    );

    expect(result).toEqual([]);
  });

  it("agrega una medicacion creada solo en caches del paciente correspondiente", () => {
    const newMedication = buildMedication({ id: 11, observations: "Nueva" });

    expect(isHistoriaCurrentMedicationQueryKey(activeQueryKey, "758")).toBe(true);
    expect(isHistoriaCurrentMedicationQueryKey(activeQueryKey, "999")).toBe(false);

    const result = reconcileCurrentMedicationList(
      [],
      newMedication,
      activeQueryKey,
      "upsert"
    );

    expect(result).toEqual([newMedication]);
  });

  it("soporta respuestas paginadas y mantiene total consistente", () => {
    const cachedMedication = buildMedication({ id: 3 });
    const savedMedication = buildMedication({
      id: 3,
      observations: "Actualizada",
    });

    const result = reconcileCurrentMedicationQueryData(
      { currentMedications: [cachedMedication], total: 1 },
      savedMedication,
      activeQueryKey,
      "replace"
    );

    expect(result).toMatchObject({
      total: 1,
      currentMedications: [{ observations: "Actualizada" }],
    });
  });

  it("elimina la medicacion de listas simples y respuestas paginadas", () => {
    const current = buildMedication({ id: 1 });
    const another = buildMedication({ id: 2 });

    expect(removeCurrentMedicationQueryData([current, another], "1")).toEqual([
      another,
    ]);
    expect(
      removeCurrentMedicationQueryData(
        { currentMedications: [current, another], total: 2 },
        "2"
      )
    ).toMatchObject({
      total: 1,
      currentMedications: [current],
    });
  });
});
