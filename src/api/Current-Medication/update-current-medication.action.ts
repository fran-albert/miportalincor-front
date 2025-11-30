import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { UpdateCurrentMedicationDto, CurrentMedication } from "@/types/Current-Medication/Current-Medication";

export const updateCurrentMedication = async (
    id: string,
    values: UpdateCurrentMedicationDto
): Promise<CurrentMedication> => {
    await sleep(1);
    const { data } = await apiIncorHC.patch<CurrentMedication>(`current-medication/${id}`, values);
    return data;
}