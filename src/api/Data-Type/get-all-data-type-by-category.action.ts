import { apiLaboral } from "@/services/axiosConfig";
import { DataType } from "@/types/Data-Type/Data-Type";

export const getAllDataTypeByCategories = async (categories: string[]) => {
    const params = new URLSearchParams();
    categories.forEach(category => params.append("categories", category));

    const { data } = await apiLaboral.get<DataType[]>(`data-types?${params.toString()}`);
    return data;
};
