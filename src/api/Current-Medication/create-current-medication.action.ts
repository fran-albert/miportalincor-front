import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { CreateCurrentMedicationDto, CurrentMedication } from "@/types/Current-Medication/Current-Medication";

export const createCurrentMedication = async (values: CreateCurrentMedicationDto): Promise<CurrentMedication> => {
    await sleep(1);
    const { data } = await apiIncorHC.post<CurrentMedication>(`current-medication`, values);
    return data;
}