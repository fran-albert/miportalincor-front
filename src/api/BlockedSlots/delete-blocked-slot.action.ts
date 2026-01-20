import { apiTurnos } from "@/services/axiosConfig";

export const deleteBlockedSlot = async (id: number): Promise<void> => {
  await apiTurnos.delete(`blocked-slots/${id}`);
};

export const deleteBlockedSlotBySlot = async (
  doctorId: number,
  date: string,
  hour: string
): Promise<void> => {
  await apiTurnos.delete(`blocked-slots/doctor/${doctorId}/${date}/${hour}`);
};
