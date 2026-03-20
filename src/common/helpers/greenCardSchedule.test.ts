import { describe, expect, it } from "vitest";
import {
  compareGreenCardItems,
  sortGreenCardSchedules,
} from "./greenCardSchedule";
import type { GreenCardItem } from "@/types/Green-Card/GreenCard";

const buildItem = (overrides: Partial<GreenCardItem>): GreenCardItem => ({
  id: overrides.id ?? crypto.randomUUID(),
  doctorUserId: overrides.doctorUserId ?? "doctor-1",
  schedule: overrides.schedule ?? "Desayuno",
  medicationName: overrides.medicationName ?? "Medicacion",
  dosage: overrides.dosage ?? "1 comprimido",
  quantity: overrides.quantity,
  notes: overrides.notes,
  isActive: overrides.isActive ?? true,
  canEdit: overrides.canEdit ?? true,
  hasPendingPrescription: overrides.hasPendingPrescription ?? false,
  displayOrder: overrides.displayOrder ?? 1,
  createdAt: overrides.createdAt ?? "2026-03-20T10:00:00.000Z",
  updatedAt: overrides.updatedAt ?? "2026-03-20T10:00:00.000Z",
  doctor: overrides.doctor,
});

describe("greenCardSchedule", () => {
  it("mezcla etiquetas y horarios personalizados en orden cronologico", () => {
    const sortedSchedules = sortGreenCardSchedules([
      "Antes de dormir",
      "11:00",
      "Media mañana",
      "Ayuno",
      "Almuerzo",
    ]);

    expect(sortedSchedules).toEqual([
      "Ayuno",
      "Media mañana",
      "11:00",
      "Almuerzo",
      "Antes de dormir",
    ]);
  });

  it("prioriza la etiqueta textual cuando comparte franja con una hora exacta", () => {
    const sortedSchedules = sortGreenCardSchedules(["08:00", "Desayuno"]);

    expect(sortedSchedules).toEqual(["Desayuno", "08:00"]);
  });

  it("mantiene orden estable dentro del mismo horario usando displayOrder y createdAt", () => {
    const laterItem = buildItem({
      id: "2",
      schedule: "11:00",
      medicationName: "B",
      displayOrder: 2,
      createdAt: "2026-03-20T12:00:00.000Z",
    });
    const earlierItem = buildItem({
      id: "1",
      schedule: "11:00",
      medicationName: "A",
      displayOrder: 1,
      createdAt: "2026-03-20T11:00:00.000Z",
    });

    const sortedItems = [laterItem, earlierItem].sort(compareGreenCardItems);

    expect(sortedItems.map((item) => item.id)).toEqual(["1", "2"]);
  });
});
