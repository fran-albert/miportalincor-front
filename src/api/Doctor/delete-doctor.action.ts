import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { Doctor } from "@/types/Doctor/Doctor";

export const deleteDoctor = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.delete<Doctor>(`Doctor/${id}`);
    return data;
}
