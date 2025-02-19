import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";

export const deleteNutritionData = async (id: number) => {
    await sleep(2);
    const { data } = await axiosInstance.delete<NutritionData>(`NutritionData/${id}`);
    return data;
}
