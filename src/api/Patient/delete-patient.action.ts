import { sleep } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { apiIncorHC } from "@/services/axiosConfig";

export const deletePatient = async (id: string) => {
    await sleep(2);
    const { data } = await apiIncorHC.delete<Patient>(`patient/${id}`);
    return data;
}
