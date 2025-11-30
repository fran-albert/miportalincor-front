import { sleep } from "@/common/helpers/helpers";
import { apiLaboral, apiIncorHC } from "@/services/axiosConfig";
import { CreateDataValuesDto, DataValue, CreateDataValuesHCDto, DataValueHC } from "@/types/Data-Value/Data-Value";

export const createDataValues = async (values: CreateDataValuesDto) => {
    await sleep(2);
    const { data } = await apiLaboral.post<DataValue[]>(`data-values`, values);
    return data;
}

export const createDataValuesHC = async (values: CreateDataValuesHCDto) => {
    await sleep(2);
    const { data } = await apiIncorHC.post<DataValueHC[]>(`historia-clinica`, values);
    return data;
}
