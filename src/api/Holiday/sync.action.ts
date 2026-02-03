import { apiTurnos } from "@/services/axiosConfig";
import { SyncHolidaysResult } from "@/types/Holiday/Holiday";

export const syncHolidays = async (year?: number): Promise<SyncHolidaysResult> => {
  const url = year ? `holidays/sync/${year}` : "holidays/sync";
  const { data } = await apiTurnos.post<SyncHolidaysResult>(url);
  return data;
};
