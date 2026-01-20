import { apiTurnos } from "@/services/axiosConfig";
import { BlockedSlotResponseDto } from "@/types/BlockedSlot/BlockedSlot";

export const getBlockedSlotsByDoctorAndDate = async (
  doctorId: number,
  date: string
): Promise<BlockedSlotResponseDto[]> => {
  const { data } = await apiTurnos.get<BlockedSlotResponseDto[]>(
    `blocked-slots/doctor/${doctorId}/date/${date}`
  );
  return data;
};
