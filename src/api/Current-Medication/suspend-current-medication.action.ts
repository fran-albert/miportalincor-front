import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { SuspendCurrentMedicationDto, CurrentMedication } from "@/types/Current-Medication/Current-Medication";

export const suspendCurrentMedication = async (
    id: string,
    values: SuspendCurrentMedicationDto
): Promise<CurrentMedication> => {
    await sleep(1);
    const { data } = await apiIncorHC.patch<CurrentMedication>(`current-medication/${id}/suspend`, values);
    return data;
}