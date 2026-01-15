import { apiTurnos } from "@/services/axiosConfig";
import { CheckupType } from "@/types/Periodic-Checkup/PeriodicCheckup";

export const getCheckupTypes = async (): Promise<CheckupType[]> => {
  const { data } = await apiTurnos.get<CheckupType[]>("periodic-checkup/types");
  return data;
};

export const getActiveCheckupTypes = async (): Promise<CheckupType[]> => {
  const { data } = await apiTurnos.get<CheckupType[]>("periodic-checkup/types/active");
  return data;
};

export const getCheckupTypeById = async (id: number): Promise<CheckupType> => {
  const { data } = await apiTurnos.get<CheckupType>(`periodic-checkup/types/${id}`);
  return data;
};
