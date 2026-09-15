import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  getCalendarDateRange,
  shouldSearchFirstAvailableDate,
} from "./calendarDateRange";

const compactRange = (view: Parameters<typeof getCalendarDateRange>[0], date: Date, options?: Parameters<typeof getCalendarDateRange>[2]) => {
  const range = getCalendarDateRange(view, date, options);
  return {
    start: format(range.start, "yyyy-MM-dd"),
    end: format(range.end, "yyyy-MM-dd"),
  };
};

describe("getCalendarDateRange", () => {
  const tuesday = new Date(2026, 8, 15, 12);

  it("requests exactly one day in day view", () => {
    expect(compactRange("day", tuesday)).toEqual({
      start: "2026-09-15",
      end: "2026-09-15",
    });
  });

  it("requests the Monday-to-Sunday range in week view", () => {
    expect(compactRange("week", tuesday)).toEqual({
      start: "2026-09-14",
      end: "2026-09-20",
    });
  });

  it("matches the five- or six-day custom work-week range", () => {
    expect(compactRange("work_week", tuesday)).toEqual({
      start: "2026-09-14",
      end: "2026-09-18",
    });
    expect(
      compactRange("work_week", tuesday, {
        includeSaturdayInWorkWeek: true,
      }),
    ).toEqual({
      start: "2026-09-14",
      end: "2026-09-19",
    });
  });

  it("requests the complete visible month grid without a fixed buffer", () => {
    expect(compactRange("month", tuesday)).toEqual({
      start: "2026-08-31",
      end: "2026-10-04",
    });

    expect(compactRange("month", new Date(2026, 1, 10, 12))).toEqual({
      start: "2026-01-26",
      end: "2026-03-01",
    });
  });

  it("matches react-big-calendar's default 30-day agenda range", () => {
    expect(compactRange("agenda", tuesday)).toEqual({
      start: "2026-09-15",
      end: "2026-10-15",
    });
  });
});

describe("shouldSearchFirstAvailableDate", () => {
  it("never enables the six-month search for a secretary selecting a doctor", () => {
    expect(shouldSearchFirstAvailableDate(false, undefined, true)).toBe(false);
    expect(shouldSearchFirstAvailableDate(false, 42, true)).toBe(false);
  });

  it("keeps first-availability navigation for an active doctor's own agenda", () => {
    expect(shouldSearchFirstAvailableDate(true, 42, true)).toBe(true);
    expect(shouldSearchFirstAvailableDate(true, 42, false)).toBe(false);
  });
});
