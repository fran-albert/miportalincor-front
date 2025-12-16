import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { DataValueHC, UpdateDataValueHCDto } from "@/types/Data-Value/Data-Value";

export const updateDataValueHC = async (
    id: string,
    values: UpdateDataValueHCDto
): Promise<DataValueHC> => {
    await sleep(1);
    const { data } = await apiIncorHC.patch<DataValueHC>(`data-values/${id}`, values);
    return data;
};
