import { apiIncorHC } from "@/services/axiosConfig";

export interface AvailableDoctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender?: string;
  specialities: {
    id: number;
    name: string;
  }[];
  notes?: string;
}

export const getAvailableDoctorsForPrescriptions = async (): Promise<AvailableDoctor[]> => {
  const { data } = await apiIncorHC.get<AvailableDoctor[]>(`doctor-settings/available-doctors`);
  return data;
};
