import { apiTurnos } from "@/services/axiosConfig";
import { AvailableSlot } from "@/types/Appointment/Appointment";

export const getAvailableSlots = async (
  doctorId: number,
  date: string,
  consultationTypeId?: number,
): Promise<AvailableSlot[]> => {
  const params: Record<string, string> = {};
  if (consultationTypeId) {
    params.consultationTypeId = consultationTypeId.toString();
  }

  // Backend returns string[] (available hours only)
  const { data } = await apiTurnos.get<string[]>(
    `appointments/doctor/${doctorId}/${date}/slots`,
    { params },
  );

  // Transform to AvailableSlot[] format
  return data.map((hour) => ({
    hour,
    available: true, // All returned slots are available
  }));
};
