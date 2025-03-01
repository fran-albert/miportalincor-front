import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";

export const deleteNutritionData = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.delete<NutritionData>(`NutritionData/${id}`);
    return data;
}
