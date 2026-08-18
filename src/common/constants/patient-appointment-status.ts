import { AppointmentStatus } from "@/types/Appointment/Appointment";
import { OverturnStatus } from "@/types/Overturn/Overturn";

/**
 * El vocabulario del PACIENTE, separado del vocabulario del staff.
 *
 * 🔴 `AppointmentStatusLabels` / `AppointmentStatusColors` (y sus equivalentes
 * de sobreturno) son el idioma del backoffice y NO se tocan: "Pendiente" en
 * amarillo es información operativa correcta para la secretaría —el turno está
 * agendado y la persona todavía no llegó—, pero al paciente se le lee como
 * "todavía no me lo confirmaron". Por eso el portal usa estos diccionarios.
 *
 * `Record<AppointmentStatus, string>` es a propósito: si mañana aparece un
 * estado nuevo, el compilador exige traducirlo también acá.
 */
export const PatientAppointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.REQUESTED_BY_PATIENT]: "Turno solicitado",
  [AppointmentStatus.ASSIGNED_BY_SECRETARY]: "Turno reservado",
  [AppointmentStatus.PENDING]: "Turno reservado",
  [AppointmentStatus.WAITING]: "En sala de espera",
  [AppointmentStatus.ATTENDING]: "En consulta",
  [AppointmentStatus.COMPLETED]: "Atendido",
  [AppointmentStatus.CANCELLED_BY_PATIENT]: "Cancelado por vos",
  [AppointmentStatus.CANCELLED_BY_SECRETARY]: "Cancelado por la clínica",
};

export const PatientAppointmentStatusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.REQUESTED_BY_PATIENT]: "bg-blue-100 text-blue-800",
  [AppointmentStatus.ASSIGNED_BY_SECRETARY]: "bg-green-100 text-green-800",
  [AppointmentStatus.PENDING]: "bg-green-100 text-green-800",
  [AppointmentStatus.WAITING]: "bg-orange-100 text-orange-800",
  [AppointmentStatus.ATTENDING]: "bg-purple-100 text-purple-800",
  [AppointmentStatus.COMPLETED]: "bg-slate-100 text-slate-700",
  [AppointmentStatus.CANCELLED_BY_PATIENT]: "bg-red-100 text-red-800",
  [AppointmentStatus.CANCELLED_BY_SECRETARY]: "bg-red-100 text-red-800",
};

/**
 * Los sobreturnos del control integral llegan al portal, así que hablan el
 * mismo idioma. `OverturnStatus` no tiene los dos estados de origen.
 */
export const PatientOverturnStatusLabels: Record<OverturnStatus, string> = {
  [OverturnStatus.PENDING]: "Turno reservado",
  [OverturnStatus.WAITING]: "En sala de espera",
  [OverturnStatus.ATTENDING]: "En consulta",
  [OverturnStatus.COMPLETED]: "Atendido",
  [OverturnStatus.CANCELLED_BY_PATIENT]: "Cancelado por vos",
  [OverturnStatus.CANCELLED_BY_SECRETARY]: "Cancelado por la clínica",
};

export const PatientOverturnStatusColors: Record<OverturnStatus, string> = {
  [OverturnStatus.PENDING]: "bg-green-100 text-green-800",
  [OverturnStatus.WAITING]: "bg-orange-100 text-orange-800",
  [OverturnStatus.ATTENDING]: "bg-purple-100 text-purple-800",
  [OverturnStatus.COMPLETED]: "bg-slate-100 text-slate-700",
  [OverturnStatus.CANCELLED_BY_PATIENT]: "bg-red-100 text-red-800",
  [OverturnStatus.CANCELLED_BY_SECRETARY]: "bg-red-100 text-red-800",
};

/** La frase que hoy tendría que llegar por WhatsApp y no siempre llega. */
export const PATIENT_NO_CONFIRMATION_NEEDED_TEXT =
  "No hace falta confirmar: tu turno ya está reservado.";
