import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { Speciality } from "@/types/Speciality/Speciality";

export const updateSpeciality = async (id: number, newSpeciality: Speciality) => {
    await sleep(2);
    const { data } = await axiosInstance.put<Speciality>(`Speciality/${id}`, newSpeciality);
    return data;
}
