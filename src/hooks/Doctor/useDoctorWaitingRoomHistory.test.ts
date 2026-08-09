import { describe, expect, it } from "vitest";
import { AppointmentStatus } from "@/types/Appointment/Appointment";
import { OverturnStatus } from "@/types/Overturn/Overturn";
import {
  buildAgendaStats,
  toDoctorWaitingRoomHistoryAgenda,
} from "./useDoctorWaitingRoomHistory.helpers";
import type { DoctorWaitingRoomHistoryResponse } from "@/api/Doctors/get-waiting-room-history.action";

const response: DoctorWaitingRoomHistoryResponse = {
  preset: "last7",
  timezone: "America/Argentina/Buenos_Aires",
  dateFrom: "2026-05-07",
  dateTo: "2026-05-13",
  requestedDates: ["2026-05-12", "2026-05-13"],
  workedDates: ["2026-05-12"],
  nonWorkingDates: ["2026-05-13"],
  appointments: [
    {
      id: 10,
      doctorId: 7,
      patientId: 51,
      date: "2026-05-12",
      hour: "10:00",
      status: AppointmentStatus.COMPLETED,
      isGuest: false,
      createdAt: "2026-05-12T12:00:00.000Z",
      updatedAt: "2026-05-12T12:00:00.000Z",
      patient: {
        userId: 51,
        firstName: "Juan",
        lastName: "Perez",
      },
    },
  ],
  overturns: [
    {
      id: 20,
      doctorId: 7,
      patientId: 52,
      date: "2026-05-12",
      hour: "09:30",
      status: OverturnStatus.CANCELLED_BY_SECRETARY,
      isGuest: false,
      createdBy: 2,
      createdAt: "2026-05-12T12:00:00.000Z",
      patient: {
        userId: 52,
        firstName: "Maria",
        lastName: "Gomez",
      },
    },
  ],
};

describe("useDoctorWaitingRoomHistory helpers", () => {
  it("maps backend history into sorted agenda items", () => {
    const agenda = toDoctorWaitingRoomHistoryAgenda(response);

    expect(agenda).toHaveLength(2);
    expect(agenda[0]).toMatchObject({
      id: 20,
      type: "overturn",
      hour: "09:30",
    });
    expect(agenda[1]).toMatchObject({
      id: 10,
      type: "appointment",
      hour: "10:00",
    });
  });

  it("builds completed and cancelled stats for historical agenda", () => {
    const agenda = toDoctorWaitingRoomHistoryAgenda(response);

    expect(buildAgendaStats(agenda)).toMatchObject({
      total: 2,
      completed: 1,
      cancelled: 1,
      waiting: 0,
      attending: 0,
    });
  });
});

describe("el control ginecológico integral en el historial", () => {
  it("🔴 el vínculo llega a la agenda, no se pierde en el mapeo", () => {
    const link = {
      role: "ULTRASOUND" as const,
      counterpartType: "APPOINTMENT" as const,
      counterpartId: 9539,
      counterpartDoctorId: 388,
      counterpartDoctorFirstName: "Victoria",
      counterpartDoctorLastName: "Tudela",
      counterpartDate: "2026-05-12",
      counterpartHour: "10:20",
      counterpartDescription: "Control Ginecológico Integral",
      color: "#D946EF",
    };

    const agenda = toDoctorWaitingRoomHistoryAgenda({
      ...response,
      overturns: [{ ...response.overturns[0], integralCheckup: link }],
    });

    const ultrasound = agenda.find((item) => item.type === "overturn");
    expect(ultrasound?.integralCheckup).toEqual(link);
  });

  it("un turno común queda con el vínculo en null, no en undefined", () => {
    const agenda = toDoctorWaitingRoomHistoryAgenda(response);

    for (const item of agenda) {
      expect(item.integralCheckup).toBeNull();
    }
  });
});
