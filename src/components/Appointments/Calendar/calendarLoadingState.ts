interface CalendarLoadingState {
  isDashboardFetching: boolean;
  searchFirstAvailability: boolean;
  isSearchingFirstDate: boolean;
}

export const shouldShowCalendarLoadingOverlay = ({
  isDashboardFetching,
  searchFirstAvailability,
  isSearchingFirstDate,
}: CalendarLoadingState) =>
  isDashboardFetching ||
  (searchFirstAvailability && isSearchingFirstDate);
