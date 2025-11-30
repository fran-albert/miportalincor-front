import { apiIncorHC } from "@/services/axiosConfig";

export interface DashboardStatistics {
  totalPatients: number;
  totalDoctors: number;
  totalUsers: number;
  patientsThisMonth: number;
  doctorsThisMonth: number;
}

export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  const response = await apiIncorHC.get<DashboardStatistics>("/statistics/dashboard");
  return response.data;
};
