import { describe, expect, it } from "vitest";
import { normalizeDoctorUserId } from "./normalizeDoctorUserId";

describe("normalizeDoctorUserId", () => {
  it("accepts numeric userId values", () => {
    expect(normalizeDoctorUserId(80)).toBe(80);
  });

  it("accepts numeric strings returned by HC", () => {
    expect(normalizeDoctorUserId("80")).toBe(80);
  });

  it("rejects invalid values", () => {
    expect(normalizeDoctorUserId(undefined)).toBeNull();
    expect(normalizeDoctorUserId("")).toBeNull();
    expect(normalizeDoctorUserId("abc")).toBeNull();
    expect(normalizeDoctorUserId(0)).toBeNull();
  });
});
