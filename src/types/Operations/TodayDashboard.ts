export type OperationsDashboardEventType = "appointment" | "overturn";

export type OperationsDashboardDoctorStatus =
  | "working"
  | "with_activity"
  | "idle";

export type OperationsEventStatus =
  | "REQUESTED_BY_PATIENT"
  | "ASSIGNED_BY_SECRETARY"
  | "PENDING"
  | "WAITING"
  | "ATTENDING"
  | "COMPLETED"
  | "CANCELLED_BY_PATIENT"
  | "CANCELLED_BY_SECRETARY"
  | "NO_SHOW";

export interface OperationsTodaySummary {
  appointments: number;
  overturns: number;
  totalEvents: number;
  workingDoctors: number;
  waiting: number;
  called: number;
  attending: number;
  completed: number;
  noShow: number;
}

export interface OperationsTodayEvent {
  type: OperationsDashboardEventType;
  id: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
  patientDocument?: string;
  hour: string;
  status: OperationsEventStatus;
  isGuest: boolean;
  consultationTypeNames?: string[];
}

export interface OperationsTodayDoctor {
  doctorId: number;
  doctorName: string;
  specialities?: string[];
  isWorkingToday: boolean;
  startTime?: string;
  endTime?: string;
  appointments: number;
  overturns: number;
  waiting: number;
  called: number;
  attending: number;
  completed: number;
  noShow: number;
  nextEventHour?: string;
  status: OperationsDashboardDoctorStatus;
}

export interface OperationsTodayDashboard {
  date: string;
  generatedAt: string;
  summary: OperationsTodaySummary;
  nextEvents: OperationsTodayEvent[];
  doctors: OperationsTodayDoctor[];
}
