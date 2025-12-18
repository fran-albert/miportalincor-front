import { Secretary } from "@/types/Secretary/Secretary";
import { apiIncorHC } from "@/services/axiosConfig";

export const reactivateSecretary = async (id: string): Promise<Secretary> => {
    const { data } = await apiIncorHC.patch<Secretary>(`/secretaries/${id}/reactivate`);
    return data;
}
