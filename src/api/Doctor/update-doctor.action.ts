import { Doctor } from "@/types/Doctor/Doctor";
import axiosInstance from "@/services/axiosConfig";

export const updateDoctor = async (id: number, doctor: Doctor) => {
    const { data } = await axiosInstance.put<Doctor>(`Doctor/${id}`, doctor);
    return data;
}
