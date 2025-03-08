import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { Speciality } from "@/types/Speciality/Speciality";

export const deleteSpeciality = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.delete<Speciality>(`Speciality/${id}`);
    return data;
}
