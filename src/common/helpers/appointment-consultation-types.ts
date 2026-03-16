import { ConsultationTypeBasicDto } from "@/types/Appointment/Appointment";

type AppointmentConsultationTypeLike = {
  consultationType?: ConsultationTypeBasicDto | null;
  consultationTypes?: ConsultationTypeBasicDto[] | null;
};

export const getAppointmentConsultationTypes = (
  appointment?: AppointmentConsultationTypeLike | null
): ConsultationTypeBasicDto[] => {
  if (!appointment) {
    return [];
  }

  const source =
    appointment.consultationTypes && appointment.consultationTypes.length > 0
      ? appointment.consultationTypes
      : appointment.consultationType
        ? [appointment.consultationType]
        : [];

  const seen = new Set<number>();
  return source.filter((type): type is ConsultationTypeBasicDto => {
    if (!type || typeof type.id !== "number") {
      return false;
    }
    if (seen.has(type.id)) {
      return false;
    }
    seen.add(type.id);
    return true;
  });
};

export const getAppointmentPrimaryConsultationType = (
  appointment?: AppointmentConsultationTypeLike | null
): ConsultationTypeBasicDto | null =>
  getAppointmentConsultationTypes(appointment)[0] ?? null;

export const getAppointmentConsultationTypeSummary = (
  appointment?: AppointmentConsultationTypeLike | null
): string | null => {
  const consultationTypes = getAppointmentConsultationTypes(appointment);

  if (consultationTypes.length === 0) {
    return null;
  }

  if (consultationTypes.length === 1) {
    return consultationTypes[0].name;
  }

  return `${consultationTypes[0].name} +${consultationTypes.length - 1}`;
};
