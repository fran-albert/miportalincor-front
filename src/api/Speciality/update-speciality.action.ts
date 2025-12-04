import { apiIncorHC } from "@/services/axiosConfig";
import { Speciality } from "@/types/Speciality/Speciality";

export const updateSpeciality = async (id: number, newSpeciality: Speciality) => {
    const { data } = await apiIncorHC.put<Speciality>(`/speciality/${id}`, newSpeciality);
    return data;
}
