import { apiTurnos } from "@/services/axiosConfig";

export const deleteDoctorScheduleException = async (
  id: number,
): Promise<void> => {
  await apiTurnos.delete(`doctor-schedule-exceptions/${id}`);
};
