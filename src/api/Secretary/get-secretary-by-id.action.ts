import { Secretary } from "@/types/Secretary/Secretary";
import { apiIncorHC } from "@/services/axiosConfig";

export const getSecretaryById = async (id: string): Promise<Secretary> => {
    const { data } = await apiIncorHC.get<Secretary>(`/secretaries/${id}`);
    return data;
}
