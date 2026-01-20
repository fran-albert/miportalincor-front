import { apiTurnos } from "@/services/axiosConfig";
import { CheckupType, CreateCheckupTypeDto, UpdateCheckupTypeDto } from "@/types/Periodic-Checkup/PeriodicCheckup";

export const createCheckupType = async (dto: CreateCheckupTypeDto): Promise<CheckupType> => {
  const { data } = await apiTurnos.post<CheckupType>("periodic-checkup/types", dto);
  return data;
};

export const updateCheckupType = async (id: number, dto: UpdateCheckupTypeDto): Promise<CheckupType> => {
  const { data } = await apiTurnos.patch<CheckupType>(`periodic-checkup/types/${id}`, dto);
  return data;
};

export const deleteCheckupType = async (id: number): Promise<void> => {
  await apiTurnos.delete(`periodic-checkup/types/${id}`);
};
