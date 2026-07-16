import { describe, expect, it } from "vitest";
import {
  buildSplitGroups,
  instancesOfGroup,
  validateSplit,
  SplitState,
} from "./split-groups.helpers";

const ids = ["i1", "i2", "i3", "i4"];

const state = (over: Partial<SplitState> = {}): SplitState => ({
  assignment: { i1: "A", i2: "A", i3: "B", i4: "B" },
  notes: { A: "Ecografía Abdominal", B: "Ecografía Ginecológica" },
  reportGroup: "A",
  ...over,
});

describe("split-groups helpers", () => {
  it("instancesOfGroup respeta el orden original del estudio", () => {
    expect(instancesOfGroup(ids, state().assignment, "A")).toEqual(["i1", "i2"]);
    expect(instancesOfGroup(ids, state().assignment, "B")).toEqual(["i3", "i4"]);
  });

  it("valida OK cuando ambos grupos tienen imágenes y nota", () => {
    expect(validateSplit(ids, state())).toBeNull();
  });

  it("rechaza si un grupo quedó sin imágenes", () => {
    const s = state({ assignment: { i1: "A", i2: "A", i3: "A", i4: "A" } });
    expect(validateSplit(ids, s)).toMatch(/estudio B no tiene imágenes/i);
  });

  it("rechaza si falta la nota de un grupo", () => {
    const s = state({ notes: { A: "Abdominal", B: "  " } });
    expect(validateSplit(ids, s)).toMatch(/tipo\/nota del estudio B/i);
  });

  it("arma los grupos con sus imágenes, nota y el informe en el grupo elegido", () => {
    const groups = buildSplitGroups(ids, state({ reportGroup: "B" }), true);
    expect(groups).toEqual([
      { instanceIds: ["i1", "i2"], note: "Ecografía Abdominal", includeReport: false },
      { instanceIds: ["i3", "i4"], note: "Ecografía Ginecológica", includeReport: true },
    ]);
  });

  it("sin informe, ningún grupo lo lleva", () => {
    const groups = buildSplitGroups(ids, state(), false);
    expect(groups.every((g) => g.includeReport === false)).toBe(true);
  });
});
