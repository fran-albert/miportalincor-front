// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComplianceResponse } from "@/types/Program/Attendance";
import ComplianceTab from "./ComplianceTab";

const mockUseCompliance = vi.fn();

vi.mock("@/hooks/Program/useCompliance", () => ({
  useCompliance: (enrollmentId: string, from: string, to: string) =>
    mockUseCompliance(enrollmentId, from, to),
}));

const activity = (
  activityId: string,
  activityName: string,
  attended: number,
  expected: number
) => ({
  activityId,
  activityName,
  attended,
  expected,
  compliance:
    expected > 0 ? Math.round((attended / expected) * 1000) / 10 : 100,
  records: [],
  recordsWithoutActivePlan: 0,
});

// La captura de Virginia (10/09/2026 09:55), con la PSICOLOGIA 3/2.
const screenshot: ComplianceResponse = {
  enrollmentId: "enrollment-1",
  period: { from: "2026-09-01", to: "2026-09-30" },
  globalCompliance: 92.3,
  activities: [
    activity("control", "CONTROL CLINICO/CARDIOVASCULAR", 0, 1),
    activity("gym", "GIMNASIO", 5, 5),
    activity("nutrition", "NUTRICION", 5, 5),
    activity("psychology", "PSICOLOGIA", 3, 2),
  ],
  recordsWithoutActivePlan: 0,
};

describe("ComplianceTab", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 10, 9, 55));
    mockUseCompliance.mockReturnValue({
      compliance: screenshot,
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    mockUseCompliance.mockReset();
  });

  it("opens on the current calendar month, not on the last 30 days", () => {
    render(<ComplianceTab enrollmentId="enrollment-1" />);

    expect(screen.getByRole("button", { name: "Este mes" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Último mes" })).toBeNull();
    expect(mockUseCompliance).toHaveBeenLastCalledWith(
      "enrollment-1",
      "2026-09-01",
      "2026-09-30"
    );
    expect(screen.getByLabelText("Desde")).toHaveProperty(
      "value",
      "2026-09-01"
    );
    expect(screen.getByLabelText("Hasta")).toHaveProperty(
      "value",
      "2026-09-30"
    );
  });

  it("returns to the current month after picking another preset", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ComplianceTab enrollmentId="enrollment-1" />);

    await user.click(screen.getByRole("button", { name: "Últimos 3 meses" }));
    expect(mockUseCompliance).toHaveBeenLastCalledWith(
      "enrollment-1",
      "2026-07-01",
      "2026-09-30"
    );

    await user.click(screen.getByRole("button", { name: "Este mes" }));
    expect(mockUseCompliance).toHaveBeenLastCalledWith(
      "enrollment-1",
      "2026-09-01",
      "2026-09-30"
    );
  });

  it("shows the real count when attendances exceed the plan without overflowing the bar", () => {
    render(<ComplianceTab enrollmentId="enrollment-1" />);

    const card = screen.getByTestId("compliance-activity-psychology");
    expect(card.textContent).toContain("3/2 asistencias");
    expect(card.textContent).toContain("1 más de lo previsto");
    expect(card.textContent).toContain("100%");
    expect(card.textContent).not.toContain("150%");
    const bar = card.querySelector<HTMLDivElement>("[data-compliance-bar]");
    expect(bar?.style.width).toBe("100%");
  });

  it("does not flag activities that are within the plan", () => {
    render(<ComplianceTab enrollmentId="enrollment-1" />);

    const card = screen.getByTestId("compliance-activity-nutrition");
    expect(card.textContent).toContain("5/5 asistencias");
    expect(card.textContent).not.toContain("más de lo previsto");
  });
});
