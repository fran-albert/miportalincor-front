import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentDetailedDto } from "@/types/Appointment/Appointment";

export const getAllApointmentsByMonthYear = async (year: string, month: string) => {
    const { data } = await apiTurnos.get<AppointmentDetailedDto[]>(
        `appointments/month/${year}/${month}/detailed`
    );
    return data;
};