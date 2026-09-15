import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { View } from "react-big-calendar";

export interface CalendarDateRange {
  start: Date;
  end: Date;
}

interface CalendarDateRangeOptions {
  /**
   * INCOR's work-week view can reveal Saturday when the doctor works that day.
   * The dashboard query includes it so that the view can make that decision.
   */
  includeSaturdayInWorkWeek?: boolean;
  agendaLength?: number;
}

/** Mirrors the dates rendered by react-big-calendar for each supported view. */
export const getCalendarDateRange = (
  view: View,
  date: Date,
  {
    includeSaturdayInWorkWeek = false,
    agendaLength = 30,
  }: CalendarDateRangeOptions = {},
): CalendarDateRange => {
  const normalizedDate = startOfDay(date);

  if (view === "day") {
    return { start: normalizedDate, end: normalizedDate };
  }

  if (view === "week") {
    return {
      start: startOfWeek(normalizedDate, { weekStartsOn: 1 }),
      end: endOfWeek(normalizedDate, { weekStartsOn: 1 }),
    };
  }

  if (view === "work_week") {
    const start = startOfWeek(normalizedDate, { weekStartsOn: 1 });
    return {
      start,
      end: addDays(start, includeSaturdayInWorkWeek ? 5 : 4),
    };
  }

  if (view === "agenda") {
    return {
      start: normalizedDate,
      end: addDays(normalizedDate, agendaLength),
    };
  }

  return {
    start: startOfWeek(startOfMonth(normalizedDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(normalizedDate), { weekStartsOn: 1 }),
  };
};

export const shouldSearchFirstAvailableDate = (
  autoFilterForDoctor: boolean,
  doctorId: number | undefined,
  isActive: boolean,
) => autoFilterForDoctor && !!doctorId && isActive;
