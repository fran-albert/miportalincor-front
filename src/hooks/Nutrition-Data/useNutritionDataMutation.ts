import { createNutritionData } from "@/api/Nutrition-Data/create.nutrition.data";
import { deleteNutritionData } from "@/api/Nutrition-Data/delete.nutrition.data";
import { updateNutritionData } from "@/api/Nutrition-Data/update.nutrition.data";
import { uploadExcelNutritionData } from "@/api/Nutrition-Data/upload.excel.nutrition.data";
import { UpdateNutritionDataDto } from "@/types/Nutrition-Data/NutritionData";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useNutritionDataMutations = () => {
    const queryClient = useQueryClient();

    const addNutritionDataMutation = useMutation({
        mutationFn: createNutritionData,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-data', variables.userId] });
        },
        onError: (error) => {
            console.error("Error creating nutrition data", error);
        },
    });

    const uploadExcelNutritionDataMutation = useMutation({
        mutationFn: uploadExcelNutritionData,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-data', variables.userId] });
        },
        onError: (error) => {
            console.error("Error uploading excel", error);
        },
    });

    const updateNutritionDataMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateNutritionDataDto; userId: string }) => updateNutritionData(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-data', variables.userId] });
        },
        onError: (error) => {
            console.error("Error updating nutrition data", error);
        },
    });

    const deleteNutritionDataMutation = useMutation({
        mutationFn: (ids: string[]) => deleteNutritionData(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-data'] });
        },
        onError: (error) => {
            console.error("Error deleting nutrition data", error);
        },
    });

    return { addNutritionDataMutation, updateNutritionDataMutation, deleteNutritionDataMutation, uploadExcelNutritionDataMutation };
};
