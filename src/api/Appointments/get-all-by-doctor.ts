import { apiTurnos } from "@/services/axiosConfig";
import { AppointmentWithPatientDto } from "@/types/Appointment/Appointment";


export const getAllAppointmentsByDoctor = async (doctorId: number) => {
    const { data } = await apiTurnos.get<AppointmentWithPatientDto[]>(
        `appointments/doctor/${doctorId}`
    );
    return data;
};