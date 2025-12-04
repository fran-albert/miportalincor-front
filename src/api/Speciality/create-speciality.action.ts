import { apiIncorHC } from "@/services/axiosConfig";
import { Speciality } from "@/types/Speciality/Speciality";

export const createSpeciality = async (newSpeciality: Speciality) => {
    const { data } = await apiIncorHC.post<Speciality>(`/speciality`, newSpeciality);
    return data;
}
