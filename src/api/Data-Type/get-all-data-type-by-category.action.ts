import { apiLaboral, apiIncorHC } from "@/services/axiosConfig";
import { DataType } from "@/types/Data-Type/Data-Type";
import { AxiosInstance } from "axios";

const getAllDataTypeByCategoriesGeneric = async (api: AxiosInstance, categories: string[]) => {
    const params = new URLSearchParams();
    categories.forEach(category => params.append("category", category));

    const { data } = await api.get<DataType[]>(`data-types?${params.toString()}`);
    return data;
};

export const getAllDataTypeByCategoriesLaboral = async (categories: string[]) => {
    return getAllDataTypeByCategoriesGeneric(apiLaboral, categories);
};

export const getAllDataTypeByCategoriesIncor = async (categories: string[]) => {
    return getAllDataTypeByCategoriesGeneric(apiIncorHC, categories);
};

export const getAllDataTypeByCategories = getAllDataTypeByCategoriesLaboral;
