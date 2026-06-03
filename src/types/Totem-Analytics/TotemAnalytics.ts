export interface TotemAnalyticsFilters {
  dateFrom: string;
  dateTo: string;
}

export interface TotemAnalyticsOverview {
  totalTickets: number;
  scheduled: number;
  invited: number;
  administrative: number;
  unregistered: number;
}

export interface TotemAnalyticsDailyItem extends TotemAnalyticsOverview {
  date: string;
}

export interface TotemAnalyticsUnregisteredDailyItem {
  date: string;
  total: number;
}

export interface TotemAnalyticsUnregisteredSummary {
  detectedTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  resolvedEventsInRange: number;
  createdPatientsInRange: number;
  linkedExistingPatientsInRange: number;
  resolutionRate: number;
  dailyDetected: TotemAnalyticsUnregisteredDailyItem[];
  dailyResolved: TotemAnalyticsUnregisteredDailyItem[];
  dailyCreated: TotemAnalyticsUnregisteredDailyItem[];
  dailyLinkedExisting: TotemAnalyticsUnregisteredDailyItem[];
}

export interface TotemAnalyticsRegistrationBreakdown {
  total: number;
  scheduled: number;
  invited: number;
  administrative: number;
  unregistered: number;
}

export interface TotemAnalyticsRegistrationDailyItem
  extends TotemAnalyticsRegistrationBreakdown {
  date: string;
}

export interface TotemAnalyticsRegistrationsSummary {
  createdPatientsInRange: number;
  linkedExistingPatientsInRange: number;
  createdByFlow: TotemAnalyticsRegistrationBreakdown;
  linkedExistingByFlow: TotemAnalyticsRegistrationBreakdown;
  dailyCreated: TotemAnalyticsRegistrationDailyItem[];
  dailyLinkedExisting: TotemAnalyticsRegistrationDailyItem[];
}

export interface TotemAnalyticsReport {
  overview: TotemAnalyticsOverview;
  daily: TotemAnalyticsDailyItem[];
  unregistered: TotemAnalyticsUnregisteredSummary;
  registrations: TotemAnalyticsRegistrationsSummary;
}

export interface TotemPatientRegistrationStatsSource {
  primary: string;
  secondary: string;
  note: string;
}

export interface TotemPatientRegistrationDailyStats {
  date: string;
  usersCreated: number;
  patientsCreated: number;
}

export interface TotemPatientRegistrationStats {
  dateFrom: string;
  dateTo: string;
  timezone: string;
  source: TotemPatientRegistrationStatsSource;
  totalUsersCreated: number;
  totalPatientsCreated: number;
  daily: TotemPatientRegistrationDailyStats[];
}
