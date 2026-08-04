import { describe, expect, it } from "vitest";
import {
  NO_DATE_TIME,
  compareByDateDesc,
  formatStudyCount,
  groupByMonthDesc,
  parseStudyDate,
  sortNewestFirst,
} from "./studyGrouping";

describe("parseStudyDate", () => {
  it("interpreta el ISO sin hora en horario local (no corre el mes por UTC)", () => {
    const parsed = new Date(parseStudyDate("2026-08-01"));
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7); // agosto
    expect(parsed.getDate()).toBe(1);
  });

  it("interpreta el formato de pantalla dd/mm/yyyy", () => {
    const parsed = new Date(parseStudyDate("15/7/2026"));
    expect(parsed.getMonth()).toBe(6); // julio
    expect(parsed.getDate()).toBe(15);
  });

  it("acepta Date e ISO con hora", () => {
    expect(parseStudyDate(new Date(2026, 0, 5))).toBe(
      new Date(2026, 0, 5).getTime()
    );
    expect(parseStudyDate("2026-01-05T10:30:00Z")).not.toBe(NO_DATE_TIME);
  });

  it("devuelve NO_DATE_TIME para fechas vacías o inválidas", () => {
    expect(parseStudyDate(undefined)).toBe(NO_DATE_TIME);
    expect(parseStudyDate(null)).toBe(NO_DATE_TIME);
    expect(parseStudyDate("")).toBe(NO_DATE_TIME);
    expect(parseStudyDate("no es una fecha")).toBe(NO_DATE_TIME);
  });
});

describe("compareByDateDesc", () => {
  it("ordena el más nuevo primero", () => {
    expect(compareByDateDesc(2000, 1000)).toBeLessThan(0);
    expect(compareByDateDesc(1000, 2000)).toBeGreaterThan(0);
  });

  it("manda los sin fecha al final", () => {
    expect(compareByDateDesc(NO_DATE_TIME, 1000)).toBe(1);
    expect(compareByDateDesc(1000, NO_DATE_TIME)).toBe(-1);
    expect(compareByDateDesc(NO_DATE_TIME, NO_DATE_TIME)).toBe(0);
  });
});

describe("sortNewestFirst", () => {
  const studies = [
    { id: 1, date: "2021-03-10" },
    { id: 2, date: "2026-07-20" },
    { id: 3, date: "2023-11-02" },
  ];

  it("regresión del bug: un paciente con estudios de 2021 y 2026 muestra 2026 primero", () => {
    expect(sortNewestFirst(studies, (s) => s.date).map((s) => s.id)).toEqual([
      2, 3, 1,
    ]);
  });

  it("los 5 primeros son los 5 MÁS RECIENTES, no los más viejos", () => {
    const many = [
      { id: "a", date: "2021-01-01" },
      { id: "b", date: "2021-02-01" },
      { id: "c", date: "2024-01-01" },
      { id: "d", date: "2025-01-01" },
      { id: "e", date: "2026-01-01" },
      { id: "f", date: "2026-06-01" },
    ];

    expect(
      sortNewestFirst(many, (s) => s.date)
        .slice(0, 5)
        .map((s) => s.id)
    ).toEqual(["f", "e", "d", "c", "b"]);
  });

  it("no muta el array original", () => {
    const original = [...studies];
    sortNewestFirst(studies, (s) => s.date);
    expect(studies).toEqual(original);
  });
});

describe("groupByMonthDesc", () => {
  const studies = [
    { id: 1, date: "2025-12-05" },
    { id: 2, date: "2026-07-20" },
    { id: 3, date: "2026-01-15" },
    { id: 4, date: "2026-07-02" },
    { id: 5, date: "" },
  ];

  const groups = groupByMonthDesc(studies, (s) => s.date);

  it("arma los encabezados MES AÑO en descendente", () => {
    expect(groups.map((g) => g.label)).toEqual([
      "JULIO 2026",
      "ENERO 2026",
      "DICIEMBRE 2025",
      "SIN FECHA",
    ]);
  });

  it("cuenta bien cada grupo y ordena descendente adentro", () => {
    expect(groups[0].items.map((s) => s.id)).toEqual([2, 4]);
    expect(groups[1].items).toHaveLength(1);
    expect(groups[2].items).toHaveLength(1);
  });

  it("deja los sin fecha en el último grupo", () => {
    expect(groups[groups.length - 1].key).toBe("sin-fecha");
    expect(groups[groups.length - 1].items.map((s) => s.id)).toEqual([5]);
  });

  it("devuelve lista vacía si no hay estudios", () => {
    expect(groupByMonthDesc([], (s: { date: string }) => s.date)).toEqual([]);
  });

  it("no mezcla el día 1 con el mes anterior", () => {
    const borderline = groupByMonthDesc(
      [{ id: 1, date: "2026-08-01" }],
      (s) => s.date
    );
    expect(borderline[0].label).toBe("AGOSTO 2026");
  });
});

describe("formatStudyCount", () => {
  it("usa singular y plural", () => {
    expect(formatStudyCount(1)).toBe("1 estudio");
    expect(formatStudyCount(2)).toBe("2 estudios");
    expect(formatStudyCount(0)).toBe("0 estudios");
  });
});
