import { Speciality } from "@/types/Speciality/Speciality";
import { apiIncorHC } from "@/services/axiosConfig";

export const getSpecialities = async (): Promise<Speciality[]> => {
    const { data } = await apiIncorHC.get<Speciality[]>(`/speciality`);
    return data;
}
