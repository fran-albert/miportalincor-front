import { apiTurnos } from "@/services/axiosConfig";
import { Holiday, CreateHolidayDto } from "@/types/Holiday/Holiday";

export const createHoliday = async (data: CreateHolidayDto): Promise<Holiday> => {
  const response = await apiTurnos.post<Holiday>("holidays", {
    ...data,
    source: 'manual',
  });
  return response.data;
};
