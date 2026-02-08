import { apiTurnos } from "@/services/axiosConfig";

/**
 * Fetches available slots for a doctor across a date range in a single API call.
 * Returns a map of date -> available hours.
 */
export const getAvailableSlotsRange = async (
  doctorId: number,
  startDate: string,
  endDate: string
): Promise<Record<string, string[]>> => {
  const { data } = await apiTurnos.get<Record<string, string[]>>(
    `appointments/doctor/${doctorId}/slots-range`,
    { params: { startDate, endDate } }
  );
  return data;
};
