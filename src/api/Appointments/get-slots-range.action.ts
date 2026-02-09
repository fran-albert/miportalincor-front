import { apiTurnos } from "@/services/axiosConfig";
import { AxiosError } from "axios";
import { addDays, parseISO } from "date-fns";

/**
 * Fetches available slots for a doctor across a date range.
 * Tries the bulk endpoint first; if it returns 404 (not deployed yet),
 * falls back to individual per-day calls.
 */
export const getAvailableSlotsRange = async (
  doctorId: number,
  startDate: string,
  endDate: string
): Promise<Record<string, string[]>> => {
  // Try bulk endpoint first
  try {
    const { data } = await apiTurnos.get<Record<string, string[]>>(
      `appointments/doctor/${doctorId}/slots-range`,
      { params: { startDate, endDate } }
    );
    return data;
  } catch (error) {
    const axiosErr = error as AxiosError;
    // Only fallback on 404 (endpoint not deployed). Re-throw other errors.
    if (axiosErr.response?.status !== 404) {
      throw error;
    }
  }

  // Fallback: individual calls per day
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const result: Record<string, string[]> = {};

  const promises: Array<{ date: string; promise: Promise<string[]> }> = [];

  let current = start;
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    promises.push({
      date: dateStr,
      promise: apiTurnos
        .get<string[]>(`appointments/doctor/${doctorId}/${dateStr}/slots`)
        .then((res) => res.data)
        .catch(() => [] as string[]),
    });
    current = addDays(current, 1);
  }

  const results = await Promise.all(
    promises.map(async (p) => ({
      date: p.date,
      hours: await p.promise,
    }))
  );

  for (const r of results) {
    result[r.date] = r.hours;
  }

  return result;
};
