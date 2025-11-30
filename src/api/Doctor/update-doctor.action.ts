import { Doctor } from "@/types/Doctor/Doctor";
import { UpdateDoctorDto } from "@/types/Doctor/UpdateDoctor.dto";
import { apiIncorHC } from "@/services/axiosConfig";

export const updateDoctor = async (id: string, doctor: UpdateDoctorDto) => {
    const { data } = await apiIncorHC.put<Doctor>(`doctor/${id}`, doctor);
    return data;
}
