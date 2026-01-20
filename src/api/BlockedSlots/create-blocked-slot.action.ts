import { apiTurnos } from "@/services/axiosConfig";
import { BlockedSlotResponseDto, CreateBlockedSlotDto } from "@/types/BlockedSlot/BlockedSlot";

export const createBlockedSlot = async (
  dto: CreateBlockedSlotDto
): Promise<BlockedSlotResponseDto> => {
  const { data } = await apiTurnos.post<BlockedSlotResponseDto>("blocked-slots", dto);
  return data;
};
