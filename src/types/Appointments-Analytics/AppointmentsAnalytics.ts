import { AppointmentOrigin, AppointmentStatus } from "@/types/Appointment/Appointment";

export interface AppointmentsAnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  doctorId?: number;
  consultationTypeId?: number;
  origin?: AppointmentOrigin;
  status?: AppointmentStatus;
}

export interface AppointmentsAnalyticsOverview {
  totalCreated: number;
  totalScheduled: number;
  totalCompleted: number;
  totalCancelled: number;
  cancellationRate: number;
}

export interface AppointmentsAnalyticsGroupedItem {
  id?: number;
  label: string;
  color?: string;
  total: number;
  completed: number;
  cancelled: number;
}

export interface AppointmentsAnalyticsOriginItem extends AppointmentsAnalyticsGroupedItem {
  origin?: AppointmentOrigin | null;
}

export interface AppointmentsAnalyticsDoctorOriginBreakdown {
  origin?: AppointmentOrigin | null;
  total: number;
}

export interface AppointmentsAnalyticsDoctorItem extends AppointmentsAnalyticsGroupedItem {
  doctorId: number;
  originBreakdown: AppointmentsAnalyticsDoctorOriginBreakdown[];
}

export interface AppointmentsAnalyticsTrendPoint {
  bucket: string;
  cancelledByPatient: number;
  cancelledBySecretary: number;
  totalCancelled: number;
}

export interface AppointmentsAnalyticsCancellations {
  trend: AppointmentsAnalyticsTrendPoint[];
  byConsultationType: AppointmentsAnalyticsGroupedItem[];
  byOrigin: AppointmentsAnalyticsOriginItem[];
  byDoctor: AppointmentsAnalyticsGroupedItem[];
}

export interface OverturnAnalyticsOverview {
  totalCreated: number;
  totalCompleted: number;
  totalCancelled: number;
  byDoctor: AppointmentsAnalyticsGroupedItem[];
}
