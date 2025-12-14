import { apiIncorHC } from "@/services/axiosConfig";

export const dismissParsingAlert = async (studyId: string) => {
    const { data } = await apiIncorHC.patch<{ success: boolean }>(`study/${studyId}/dismiss-parsing-alert`);
    return data;
}
