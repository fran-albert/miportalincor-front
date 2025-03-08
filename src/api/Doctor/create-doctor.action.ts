import { sleep } from "@/common/helpers/helpers";
import { Doctor } from "@/types/Doctor/Doctor";
import { apiIncor } from "@/services/axiosConfig";

export const createDoctor = async (doctor: Doctor) => {
    await sleep(2);
    const { data } = await apiIncor.post<Doctor>(`/Doctor/create`, doctor);
    return data;
}
