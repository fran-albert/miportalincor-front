import { apiTurnos } from "@/services/axiosConfig";
import { AvailableSlot } from "@/types/Appointment/Appointment";

export const getAvailableSlots = async (
  doctorId: number,
  date: string
): Promise<AvailableSlot[]> => {
  // Backend returns string[] (available hours only)
  const { data } = await apiTurnos.get<string[]>(
    `appointments/doctor/${doctorId}/${date}/slots`
  );

  // Transform to AvailableSlot[] format
  return data.map((hour) => ({
    hour,
    available: true, // All returned slots are available
  }));
};
