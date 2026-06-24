export interface PrescriptionReportSummary {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  avgProcessingTimeHours: number;
}

export interface PrescriptionReportByDoctor {
  doctorId: number;
  doctorName: string;
  specialities: string[];
  completed: number;
  pending: number;
  rejected: number;
  avgProcessingTimeHours: number;
}

export interface PrescriptionReportWeeklyTrend {
  weekLabel: string;
  weekStart: string;
  completed: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface PrescriptionReportDateRange {
  from: string;
  to: string;
}
