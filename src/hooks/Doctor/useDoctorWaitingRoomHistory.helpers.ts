import type { AgendaItem, AgendaStats } from "@/hooks/Doctor/useDoctorDayAgenda";
import { AppointmentStatus } from "@/types/Appointment/Appointment";
import { OverturnStatus } from "@/types/Overturn/Overturn";
import type { DoctorWaitingRoomHistoryResponse } from "@/api/Doctors/get-waiting-room-history.action";

const isPending = (status: AgendaItem["status"]): boolean =>
  status === AppointmentStatus.PENDING ||
  status === OverturnStatus.PENDING ||
  status === AppointmentStatus.REQUESTED_BY_PATIENT ||
  status === AppointmentStatus.ASSIGNED_BY_SECRETARY;

const isWaiting = (status: AgendaItem["status"]): boolean =>
  status === AppointmentStatus.WAITING || status === OverturnStatus.WAITING;

const isAttending = (status: AgendaItem["status"]): boolean =>
  status === AppointmentStatus.ATTENDING ||
  status === OverturnStatus.ATTENDING;

const isCompleted = (status: AgendaItem["status"]): boolean =>
  status === AppointmentStatus.COMPLETED ||
  status === OverturnStatus.COMPLETED;

const isCancelled = (status: AgendaItem["status"]): boolean =>
  status === AppointmentStatus.CANCELLED_BY_PATIENT ||
  status === AppointmentStatus.CANCELLED_BY_SECRETARY ||
  status === OverturnStatus.CANCELLED_BY_PATIENT ||
  status === OverturnStatus.CANCELLED_BY_SECRETARY;

export const toDoctorWaitingRoomHistoryAgenda = (
  response?: DoctorWaitingRoomHistoryResponse,
): AgendaItem[] => {
  if (!response) return [];

  return [
    ...response.appointments.map(
      (appointment): AgendaItem => ({
        id: appointment.id,
        type: "appointment",
        hour: appointment.hour,
        date: appointment.date,
        status: appointment.status,
        patient: appointment.patient ?? null,
        rawData: appointment,
      }),
    ),
    ...response.overturns.map(
      (overturn): AgendaItem => ({
        id: overturn.id,
        type: "overturn",
        hour: overturn.hour,
        date: overturn.date,
        status: overturn.status,
        patient: overturn.patient ?? null,
        rawData: overturn,
      }),
    ),
  ].sort((a, b) => {
    const dateOrder = a.date.localeCompare(b.date);
    return dateOrder !== 0 ? dateOrder : a.hour.localeCompare(b.hour);
  });
};

export const buildAgendaStats = (agenda: AgendaItem[]): AgendaStats => ({
  total: agenda.length,
  pending: agenda.filter((item) => isPending(item.status)).length,
  waiting: agenda.filter((item) => isWaiting(item.status)).length,
  attending: agenda.filter((item) => isAttending(item.status)).length,
  completed: agenda.filter((item) => isCompleted(item.status)).length,
  cancelled: agenda.filter((item) => isCancelled(item.status)).length,
});
