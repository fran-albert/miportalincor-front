import type {
  OperationsEventStatus,
  OperationsTodayDoctor,
} from "@/types/Operations/TodayDashboard";

const statusLabels: Record<OperationsEventStatus, string> = {
  REQUESTED_BY_PATIENT: "Solicitado",
  ASSIGNED_BY_SECRETARY: "Asignado",
  PENDING: "Pendiente",
  WAITING: "En espera",
  ATTENDING: "Atendiendo",
  COMPLETED: "Completado",
  CANCELLED_BY_PATIENT: "Cancelado",
  CANCELLED_BY_SECRETARY: "Cancelado",
  NO_SHOW: "Ausente",
};

export const getOperationsStatusLabel = (
  status: OperationsEventStatus
): string => statusLabels[status] ?? status;

export const getOperationsStatusClass = (
  status: OperationsEventStatus
): string => {
  if (status === "WAITING") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "ATTENDING") return "bg-blue-100 text-blue-800 border-blue-200";
  if (status === "COMPLETED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "NO_SHOW") return "bg-red-100 text-red-800 border-red-200";
  if (status.startsWith("CANCELLED")) return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export const formatOperationsDate = (date: string): string => {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
};

export const getVisibleOperationsDoctors = (
  doctors: OperationsTodayDoctor[]
): OperationsTodayDoctor[] =>
  doctors.filter(
    (doctor) =>
      doctor.isWorkingToday ||
      doctor.appointments > 0 ||
      doctor.overturns > 0 ||
      doctor.waiting > 0 ||
      doctor.called > 0 ||
      doctor.attending > 0
  );
