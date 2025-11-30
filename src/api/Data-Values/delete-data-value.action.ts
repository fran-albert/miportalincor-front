import { sleep } from "@/common/helpers/helpers";
import { ISuccessOperationResponse } from "@/common/interfaces/success-operation-response.interface";
import { apiIncorHC, apiLaboral } from "@/services/axiosConfig";

export const deleteDataValue = async (id: number): Promise<void> => {
    await sleep(2);
    const { data } = await apiLaboral.delete<void>(`data-values/${id}`);
    return data;
}

export const deleteDataValuesHC = async (idDataValue: string) => {
    await sleep(2);
    const { data } = await apiIncorHC.delete<ISuccessOperationResponse>(`data-values/${idDataValue}`);
    return data;
}

