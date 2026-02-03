import { apiTurnos } from "@/services/axiosConfig";
import { Holiday } from "@/types/Holiday/Holiday";

export const getAllHolidays = async (): Promise<Holiday[]> => {
  const { data } = await apiTurnos.get<Holiday[]>("holidays");
  return data;
};
