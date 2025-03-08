import { Doctor } from "@/types/Doctor/Doctor";
import { apiIncor } from "@/services/axiosConfig";

export const updateDoctor = async (id: number, doctor: Doctor) => {
    const { data } = await apiIncor.put<Doctor>(`Doctor/${id}`, doctor);
    return data;
}
