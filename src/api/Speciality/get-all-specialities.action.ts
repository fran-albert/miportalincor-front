import { Speciality } from "@/types/Speciality/Speciality";
import { apiIncor } from "@/services/axiosConfig";

export const getSpecialities = async (): Promise<Speciality[]> => {
    // await sleep(2);
    const { data } = await apiIncor.get<Speciality[]>(`speciality/all`);
    return data
}
