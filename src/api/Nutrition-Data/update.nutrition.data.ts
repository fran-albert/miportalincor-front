import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { NutritionData, UpdateNutritionDataDto } from "@/types/Nutrition-Data/NutritionData";

export const updateNutritionData = async (id: number, newValues: UpdateNutritionDataDto) => {
    await sleep(2);
    const { data } = await apiIncor.put<NutritionData>(`NutritionData/${id}`, newValues);
    return data;
}
