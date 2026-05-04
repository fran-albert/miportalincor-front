import { describe, expect, it } from "vitest";
import {
  getArgentinaTodayDate,
  getArgentinaWeekDay,
} from "@/common/helpers/argentinaDate";
import { WeekDays } from "@/types/DoctorAvailability";

describe("argentinaDate helpers", () => {
  it("uses Argentina date when UTC is still the previous local day", () => {
    const date = new Date("2026-05-04T01:30:00.000Z");

    expect(getArgentinaTodayDate(date)).toBe("2026-05-03");
    expect(getArgentinaWeekDay(date)).toBe(WeekDays.SUNDAY);
  });

  it("uses Argentina date when UTC and local day match", () => {
    const date = new Date("2026-05-04T15:00:00.000Z");

    expect(getArgentinaTodayDate(date)).toBe("2026-05-04");
    expect(getArgentinaWeekDay(date)).toBe(WeekDays.MONDAY);
  });
});
