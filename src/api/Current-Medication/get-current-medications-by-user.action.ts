import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { CurrentMedicationResponse, CurrentMedicationFilters } from "@/types/Current-Medication/Current-Medication";

export const getCurrentMedicationsByUser = async (
    idUserHistoriaClinica: string,
    filters?: CurrentMedicationFilters
): Promise<CurrentMedicationResponse> => {
    await sleep(1);

    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.medicationName) params.append("medicationName", filters.medicationName);
    if (filters?.idDoctor) params.append("idDoctor", filters.idDoctor);
    if (filters?.startDateFrom) params.append("startDateFrom", filters.startDateFrom);
    if (filters?.startDateTo) params.append("startDateTo", filters.startDateTo);

    const { data } = await apiIncorHC.get<CurrentMedicationResponse>(
        `current-medication/user/${idUserHistoriaClinica}`,
        { params }
    );
    return data;
}