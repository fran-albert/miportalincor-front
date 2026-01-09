import { useQuery } from "@tanstack/react-query";
import { getStudiesByUserId } from "@/api/Study/get-studies-by-idUser.action";
import { usePatientAppointmentsByUserId } from "@/hooks/Appointments";
import { AppointmentStatus } from "@/types/Appointment/Appointment";

interface UsePatientStatsProps {
  userId: number;
  isAuthenticated: boolean;
}

/**
 * Determina si una fecha está en el pasado comparando con la fecha actual
 */
const isPastDate = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

export const usePatientStats = ({ userId, isAuthenticated }: UsePatientStatsProps) => {
  // Total de estudios del paciente
  const { data: studies = [], isLoading: isLoadingStudies } = useQuery({
    queryKey: ["patientStudies", userId],
    queryFn: () => getStudiesByUserId(userId),
    enabled: isAuthenticated && userId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const totalStudies = studies.length;

  // Obtener turnos del paciente
  const { appointments = [], isLoading: isLoadingAppointments } = usePatientAppointmentsByUserId({
    patientUserId: userId,
    enabled: isAuthenticated && userId > 0,
  });

  // Próxima cita: turnos futuros no cancelados ni completados, ordenados por fecha ascendente
  const upcomingAppointments = appointments
    .filter(apt =>
      !isPastDate(apt.date) &&
      apt.status !== AppointmentStatus.CANCELLED_BY_PATIENT &&
      apt.status !== AppointmentStatus.CANCELLED_BY_SECRETARY &&
      apt.status !== AppointmentStatus.COMPLETED
    )
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.hour}`);
      const dateB = new Date(`${b.date}T${b.hour}`);
      return dateA.getTime() - dateB.getTime();
    });

  const nextAppointment = upcomingAppointments[0] || null;

  // Última visita: turnos completados, ordenados por fecha descendente
  const completedAppointments = appointments
    .filter(apt => apt.status === AppointmentStatus.COMPLETED)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.hour}`);
      const dateB = new Date(`${b.date}T${b.hour}`);
      return dateB.getTime() - dateA.getTime();
    });

  const lastVisit = completedAppointments[0] || null;

  const isLoading = isLoadingStudies || isLoadingAppointments;

  return {
    stats: {
      totalStudies,
      lastStudy: studies[0] || null,
      nextAppointment: nextAppointment ? `${nextAppointment.date}T${nextAppointment.hour}` : null,
      lastVisit: lastVisit ? `${lastVisit.date}T${lastVisit.hour}` : null,
    },
    isLoading,
  };
};
