import { apiTurnos } from "@/services/axiosConfig";

export interface DoctorPendingFuture {
  doctorId: number;
  appointments: number;
  overturns: number;
  total: number;
  nextDate: string | null;
}

export const getDoctorPendingFuture = async (
  doctorId: number
): Promise<DoctorPendingFuture> => {
  const { data } = await apiTurnos.get<DoctorPendingFuture>(
    `appointments/doctor/${doctorId}/pending-future`
  );
  return data;
};
