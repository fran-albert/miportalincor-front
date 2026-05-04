import { apiTurnos } from "@/services/axiosConfig";
import type { OperationsTodayDashboard } from "@/types/Operations/TodayDashboard";

export const getOperationsTodayDashboard =
  async (): Promise<OperationsTodayDashboard> => {
    const { data } = await apiTurnos.get<OperationsTodayDashboard>(
      "/operations/today-dashboard"
    );
    return data;
  };
