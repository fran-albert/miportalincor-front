import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { CreateDataValuesHCDto, DataValueHC } from "@/types/Data-Value/Data-Value";

export const createEvolutionHC = async (values: CreateDataValuesHCDto) => {
    await sleep(2);
    const { data } = await apiIncorHC.post<DataValueHC[]>(`user-evolution`, values);
    return data;
}
