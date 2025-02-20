import axiosInstance from "@/services/axiosConfig";
import { CreateNutritionDataDto, NutritionData } from "@/types/Nutrition-Data/NutritionData";

export const createNutritionData = async (values: CreateNutritionDataDto) => {
    const { data } = await axiosInstance.post<NutritionData>(`/NutritionData/create`, values);
    return data;
}
