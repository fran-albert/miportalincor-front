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

export interface TotemAnalyticsReport {
  overview: TotemAnalyticsOverview;
  daily: TotemAnalyticsDailyItem[];
  unregistered: TotemAnalyticsUnregisteredSummary;
}
