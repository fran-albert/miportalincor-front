import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { Speciality } from "@/types/Speciality/Speciality";

export const createSpeciality = async (newSpeciality: Speciality) => {
    await sleep(2);
    const { data } = await apiIncor.post<Speciality>(`/Speciality/create`, newSpeciality);
    return data;
}
