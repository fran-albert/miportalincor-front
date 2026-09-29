import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildAdultCard,
  buildApplication,
  buildItem,
  buildVaccine,
} from "@/test/fixtures/vaccination.fixtures";
import {
  formatVaccinationDate,
  getVaccinationCalendarOverview,
  sortApplicationsByAppliedDateDesc,
} from "./vaccination-card.helpers";

const gripe = buildVaccine("gripe", "Gripe", "Influenza");
const vph = buildVaccine("vph", "VPH", "Virus del papiloma humano");
const tripleViral = buildVaccine("triple_viral", "Triple viral");

describe("formatVaccinationDate", () => {
  const originalTimeZone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "America/Argentina/Buenos_Aires";
  });

  afterEach(() => {
    process.env.TZ = originalTimeZone;
  });

  it("no corre el dia en horario de Argentina", () => {
    // La trampa: new Date("YYYY-MM-DD") es medianoche UTC = dia anterior en AR.
    expect(new Date("2026-09-28").getDate()).toBe(27);
    expect(formatVaccinationDate("2026-09-28")).toBe("28/09/2026");
    expect(formatVaccinationDate("2026-01-01")).toBe("01/01/2026");
  });

  it("usa solo la parte de fecha si viene con hora", () => {
    expect(formatVaccinationDate("2026-09-28T00:00:00.000Z")).toBe(
      "28/09/2026"
    );
  });

  it("devuelve un guion si no hay fecha", () => {
    expect(formatVaccinationDate(undefined)).toBe("-");
  });
});

describe("sortApplicationsByAppliedDateDesc", () => {
  it("ordena por fecha de aplicacion, la mas reciente primero", () => {
    const applications = [
      buildApplication({
        id: "a",
        vaccine: gripe,
        doseLabel: "1ra dosis",
        appliedDate: "2024-04-15",
      }),
      buildApplication({
        id: "b",
        vaccine: tripleViral,
        doseLabel: "1ra dosis",
        appliedDate: "2026-09-28",
      }),
      buildApplication({
        id: "c",
        vaccine: vph,
        doseLabel: "Unica dosis",
        appliedDate: "2025-03-28",
      }),
    ];

    expect(
      sortApplicationsByAppliedDateDesc(applications).map((app) => app.id)
    ).toEqual(["b", "c", "a"]);
    expect(applications.map((app) => app.id)).toEqual(["a", "b", "c"]);
  });

  it("a igual fecha, desempata por la carga mas reciente", () => {
    const applications = [
      buildApplication({
        id: "older",
        vaccine: gripe,
        doseLabel: "1ra dosis",
        appliedDate: "2026-09-28",
        createdAt: "2026-09-28T12:00:00.000Z",
      }),
      buildApplication({
        id: "newer",
        vaccine: vph,
        doseLabel: "Unica dosis",
        appliedDate: "2026-09-28",
        createdAt: "2026-09-28T13:00:00.000Z",
      }),
    ];

    expect(
      sortApplicationsByAppliedDateDesc(applications).map((app) => app.id)
    ).toEqual(["newer", "older"]);
  });
});

describe("getVaccinationCalendarOverview", () => {
  it("a un adulto no le lista las dosis del calendario infantil como vencidas", () => {
    const overview = getVaccinationCalendarOverview(buildAdultCard().items);

    expect(overview.applies).toBe(false);
    expect(overview.dueNow).toEqual([]);
    expect(overview.upcoming).toEqual([]);
    expect(overview.withoutRecordCount).toBe(27);
  });

  it("para un chico separa lo que corresponde ahora de lo proximo, sin listar las vencidas", () => {
    const items = [
      buildItem({
        scheduleRuleId: "r-overdue",
        vaccine: tripleViral,
        doseLabel: "1ra dosis",
        status: "overdue",
        recommendedDate: "2025-01-10",
      }),
      buildItem({
        scheduleRuleId: "r-upcoming-late",
        vaccine: vph,
        doseLabel: "Unica dosis",
        status: "upcoming",
        recommendedDate: "2035-01-10",
      }),
      buildItem({
        scheduleRuleId: "r-upcoming-soon",
        vaccine: tripleViral,
        doseLabel: "2da dosis",
        status: "upcoming",
        recommendedDate: "2029-01-10",
      }),
      buildItem({
        scheduleRuleId: "r-pending",
        vaccine: gripe,
        doseLabel: "1ra dosis pediatrica",
        status: "pending",
        recommendedDate: "2026-07-10",
      }),
      buildItem({
        scheduleRuleId: "r-applied",
        vaccine: gripe,
        doseLabel: "2da dosis",
        status: "applied",
        application: buildApplication({
          id: "x",
          vaccine: gripe,
          doseLabel: "2da dosis",
          appliedDate: "2026-08-10",
        }),
      }),
    ];

    const overview = getVaccinationCalendarOverview(items);

    expect(overview.applies).toBe(true);
    expect(overview.dueNow.map((item) => item.scheduleRuleId)).toEqual([
      "r-pending",
    ]);
    expect(overview.upcoming.map((item) => item.scheduleRuleId)).toEqual([
      "r-upcoming-soon",
      "r-upcoming-late",
    ]);
    expect(overview.withoutRecordCount).toBe(1);
  });
});
