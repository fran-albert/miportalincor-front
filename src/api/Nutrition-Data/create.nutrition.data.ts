import { apiIncorHC } from "@/services/axiosConfig";
import { CreateNutritionDataDto, NutritionData } from "@/types/Nutrition-Data/NutritionData";

export const createNutritionData = async (values: CreateNutritionDataDto) => {
    const { data } = await apiIncorHC.post<NutritionData>(`/nutrition-data`, values);
    return data;
}
