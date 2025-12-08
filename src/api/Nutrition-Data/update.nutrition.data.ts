import { apiIncorHC } from "@/services/axiosConfig";
import { NutritionData, UpdateNutritionDataDto } from "@/types/Nutrition-Data/NutritionData";

export const updateNutritionData = async (id: string, newValues: UpdateNutritionDataDto) => {
    const { data } = await apiIncorHC.put<NutritionData>(`/nutrition-data/${id}`, newValues);
    return data;
}
