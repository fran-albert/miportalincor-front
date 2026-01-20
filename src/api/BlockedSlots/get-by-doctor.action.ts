import { apiTurnos } from "@/services/axiosConfig";
import { BlockedSlotResponseDto } from "@/types/BlockedSlot/BlockedSlot";

export const getBlockedSlotsByDoctor = async (
  doctorId: number
): Promise<BlockedSlotResponseDto[]> => {
  const { data } = await apiTurnos.get<BlockedSlotResponseDto[]>(
    `blocked-slots/doctor/${doctorId}`
  );
  return data;
};
