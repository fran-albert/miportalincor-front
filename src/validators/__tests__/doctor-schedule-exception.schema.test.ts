import { describe, expect, it } from "vitest";
import { CreateDoctorScheduleExceptionSchema } from "../DoctorScheduleException/doctor-schedule-exception.schema";

describe("CreateDoctorScheduleExceptionSchema", () => {
  it("acepta una excepción válida por fecha", () => {
    const result = CreateDoctorScheduleExceptionSchema.safeParse({
      doctorId: 12,
      date: "2026-04-23",
      startTime: "08:00",
      endTime: "13:00",
      slotDuration: 30,
    });

    expect(result.success).toBe(true);
  });

  it("rechaza una excepción sin fecha", () => {
    const result = CreateDoctorScheduleExceptionSchema.safeParse({
      doctorId: 12,
      date: "",
      startTime: "08:00",
      endTime: "13:00",
      slotDuration: 30,
    });

    expect(result.success).toBe(false);
  });

  it("rechaza cuando la hora de fin no es mayor a la de inicio", () => {
    const result = CreateDoctorScheduleExceptionSchema.safeParse({
      doctorId: 12,
      date: "2026-04-23",
      startTime: "13:00",
      endTime: "08:00",
      slotDuration: 30,
    });

    expect(result.success).toBe(false);
  });
});
