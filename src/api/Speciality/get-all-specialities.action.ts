import { Speciality } from "@/types/Speciality/Speciality";
import axiosInstance from "@/services/axiosConfig";

export const getSpecialities = async (): Promise<Speciality[]> => {
    // await sleep(2);
    const { data } = await axiosInstance.get<Speciality[]>(`speciality/all`);
    return data
}
