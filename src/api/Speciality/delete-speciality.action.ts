import { apiIncorHC } from "@/services/axiosConfig";

export const deleteSpeciality = async (id: number) => {
    const { data } = await apiIncorHC.delete<{ message: string }>(`/speciality/${id}`);
    return data;
}
