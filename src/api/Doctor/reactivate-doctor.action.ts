import { apiIncorHC } from "@/services/axiosConfig";
import { Doctor } from "@/types/Doctor/Doctor";

export const reactivateDoctor = async (id: string): Promise<Doctor> => {
  const { data } = await apiIncorHC.patch<Doctor>(`doctor/${id}/reactivate`);
  return data;
};
