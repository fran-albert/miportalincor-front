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
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-data', variables.userId] });
            console.log("data created", data, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating data", error, variables, context);
        },
    });


    const uploadExcelNutritionDataMutation = useMutation({
        mutationFn: uploadExcelNutritionData,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-data', variables.userId] });
            console.log("data created", data, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating data", error, variables, context);
        },
    })

    const updateNutritionDataMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateNutritionDataDto }) => updateNutritionData(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-data', variables.data.userId] });
            console.log("data updated", data, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating blodTest", error, variables, context);
        },
    });

    const deleteNutritionDataMutation = useMutation({
        mutationFn: (id: number[]) => deleteNutritionData(id),
        onSuccess: (blodTest, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['nutrition-data'] });
            console.log("blodTest deleted", blodTest, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting blodTest", error, variables, context);
        },
    });

    return { addNutritionDataMutation, updateNutritionDataMutation, deleteNutritionDataMutation, uploadExcelNutritionDataMutation };
};
