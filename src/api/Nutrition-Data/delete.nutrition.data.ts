import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";

export const deleteNutritionData = async (ids: number[]) => {
  await sleep(2);
  const { data } = await apiIncor.delete<string>("NutritionData", {
    data: ids,
  });
  return data;
};
