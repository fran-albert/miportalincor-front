import { describe, expect, it } from "vitest";
import { shouldShowCalendarLoadingOverlay } from "./calendarLoadingState";

describe("shouldShowCalendarLoadingOverlay", () => {
  it("keeps the calendar blocked while a new range fetches over previous data", () => {
    expect(
      shouldShowCalendarLoadingOverlay({
        isDashboardFetching: true,
        searchFirstAvailability: false,
        isSearchingFirstDate: false,
      }),
    ).toBe(true);
  });

  it("does not block an idle calendar", () => {
    expect(
      shouldShowCalendarLoadingOverlay({
        isDashboardFetching: false,
        searchFirstAvailability: false,
        isSearchingFirstDate: false,
      }),
    ).toBe(false);
  });

  it("keeps the own-agenda first-availability search covered", () => {
    expect(
      shouldShowCalendarLoadingOverlay({
        isDashboardFetching: false,
        searchFirstAvailability: true,
        isSearchingFirstDate: true,
      }),
    ).toBe(true);
  });
});
