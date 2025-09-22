import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { ISuccessOperationResponse } from "@/common/interfaces/success-operation-response.interface";

export const deleteEvolutionHC = async (evolutionId: string) => {
    await sleep(1);
    const { data } = await apiIncorHC.delete<ISuccessOperationResponse>(`user-evolution/${evolutionId}`);
    return data;
};