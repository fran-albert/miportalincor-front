import { sleep } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { apiIncor } from "@/services/axiosConfig";

export const deletePatient = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.delete<Patient>(`Patient/${id}`);
    return data;
}
