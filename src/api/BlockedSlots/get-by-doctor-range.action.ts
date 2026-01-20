import { apiTurnos } from "@/services/axiosConfig";
import { BlockedSlotResponseDto } from "@/types/BlockedSlot/BlockedSlot";

export const getBlockedSlotsByDoctorAndRange = async (
  doctorId: number,
  startDate: string,
  endDate: string
): Promise<BlockedSlotResponseDto[]> => {
  const { data } = await apiTurnos.get<BlockedSlotResponseDto[]>(
    `blocked-slots/doctor/${doctorId}/range`,
    {
      params: { startDate, endDate },
    }
  );
  return data;
};
