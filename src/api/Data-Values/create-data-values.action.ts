import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";
import { CreateDataValuesDto, DataValue } from "@/types/Data-Value/Data-Value";

export const createDataValues = async (values: CreateDataValuesDto) => {
    await sleep(2);
    const { data } = await apiLaboral.post<DataValue[]>(`data-values`, values);
    return data;
}
