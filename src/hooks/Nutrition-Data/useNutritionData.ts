import { useQuery } from "@tanstack/react-query";
import { getNutritionDataByUserId } from "@/api/Nutrition-Data/get-by-user-id.nutrition.data";

interface Props {
  auth?: boolean;
  userId?: number; 
}

export const useNutritionData = ({ auth = true, userId }: Props) => {
  const { isLoading, isError, error, data, isFetching } = useQuery({
    queryKey: ["nutrition-data", userId],
    queryFn: () => getNutritionDataByUserId(userId!),
    staleTime: 1000 * 60,
    enabled: auth && userId !== undefined && !isNaN(userId), 
  });

  return { isLoading, isError, error, data, isFetching };
};
