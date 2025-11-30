import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { ReactivateCurrentMedicationDto, CurrentMedication } from "@/types/Current-Medication/Current-Medication";

export const reactivateCurrentMedication = async (
    id: string,
    values: ReactivateCurrentMedicationDto
): Promise<CurrentMedication> => {
    await sleep(1);
    const { data } = await apiIncorHC.put<CurrentMedication>(`current-medications/${id}/reactivate`, values);
    return data;
}