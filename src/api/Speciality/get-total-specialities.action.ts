import { apiIncorHC } from "@/services/axiosConfig";
import { Speciality } from "@/types/Speciality/Speciality";

export const getTotalSpecialities = async (): Promise<number> => {
    const { data } = await apiIncorHC.get<Speciality[]>(`/speciality`);
    return data.length;
}