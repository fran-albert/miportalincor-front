import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentResponseDto } from "@/types/Appointment/Appointment";

export const getAllAppointmentsByDate = async (date: string) => {
    const { data } = await apiTurnos.get<AppointmentResponseDto[]>(
        `appointments/date/${date}`
    );
    return data;
};