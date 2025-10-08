import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { CurrentMedication } from "@/types/Current-Medication/Current-Medication";

export const getCurrentMedicationById = async (id: string): Promise<CurrentMedication> => {
    await sleep(1);
    const { data } = await apiIncorHC.get<CurrentMedication>(`current-medications/${id}`);
    return data;
}