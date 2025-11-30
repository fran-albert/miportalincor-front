import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { Doctor } from "@/types/Doctor/Doctor";

export const deleteDoctor = async (id: string) => {
    await sleep(2);
    const { data } = await apiIncorHC.delete<Doctor>(`doctor/${id}`);
    return data;
}
