import { describe, expect, it } from "vitest";
import { calendarDateToPayloadAR, toArgentinaTime } from "./timezone";

describe("calendarDateToPayloadAR", () => {
  it("ancla la fecha calendario al mediodía de Argentina (15:00 UTC)", () => {
    expect(calendarDateToPayloadAR("2026-07-08")).toBe(
      "2026-07-08T15:00:00.000Z",
    );
  });

  it("preserva el día calendario en AR (no se corre al día anterior)", () => {
    const payload = calendarDateToPayloadAR("2026-07-08");
    expect(toArgentinaTime(payload).format("YYYY-MM-DD")).toBe("2026-07-08");
  });

  it("funciona para cualquier día", () => {
    expect(calendarDateToPayloadAR("2026-01-01")).toBe(
      "2026-01-01T15:00:00.000Z",
    );
    expect(toArgentinaTime(calendarDateToPayloadAR("2026-12-31")).format("YYYY-MM-DD")).toBe(
      "2026-12-31",
    );
  });
});
