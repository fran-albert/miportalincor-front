import { describe, expect, it } from "vitest";
import { resolveWaitingRoomRestriction } from "./useDoctorWorkingToday.helpers";

describe("resolveWaitingRoomRestriction", () => {
  it("restringe cuando no hay horario configurado y no hay actividad hoy", () => {
    expect(
      resolveWaitingRoomRestriction({
        restrictedBySchedule: true,
        hasActivityToday: false,
        isActivityLoading: false,
      }),
    ).toBe(true);
  });

  it("NO restringe si hay actividad hoy aunque falte el horario configurado", () => {
    expect(
      resolveWaitingRoomRestriction({
        restrictedBySchedule: true,
        hasActivityToday: true,
        isActivityLoading: false,
      }),
    ).toBe(false);
  });

  it("NO restringe mientras la actividad del día todavía está cargando", () => {
    expect(
      resolveWaitingRoomRestriction({
        restrictedBySchedule: true,
        hasActivityToday: false,
        isActivityLoading: true,
      }),
    ).toBe(false);
  });

  it("NO restringe cuando el horario del día existe", () => {
    expect(
      resolveWaitingRoomRestriction({
        restrictedBySchedule: false,
        hasActivityToday: false,
        isActivityLoading: false,
      }),
    ).toBe(false);
  });
});
