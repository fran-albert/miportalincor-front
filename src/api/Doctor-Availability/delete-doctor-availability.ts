import { apiTurnos } from "@/services/axiosConfig";

export const deleteDoctorAvailability = async (id: number): Promise<void> => {
    await apiTurnos.delete(`doctor-availability/${id}`);
}
