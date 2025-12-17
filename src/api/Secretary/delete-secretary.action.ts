import { apiIncorHC } from "@/services/axiosConfig";

export const deleteSecretary = async (id: string): Promise<void> => {
    await apiIncorHC.delete(`/secretaries/${id}`);
}
