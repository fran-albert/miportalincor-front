import { createDataValues } from "@/api/Data-Values/create-data-values.action";
import { deleteDataValue } from "@/api/Data-Values/delete-data-value.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useDataValuesMutations = () => {
    const queryClient = useQueryClient();

    const createDataValuesMutation = useMutation({
        mutationFn: createDataValues,
        onSuccess: (dataValues, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['data-values'] });
            console.log(" created", dataValues, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating ", error, variables, context);
        },
    });

    const deleteDataValuesMutation = useMutation({
        mutationFn: (id: number) => deleteDataValue(id),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["data-values"] });
            console.log("ok", data, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting patient", error, variables, context);
        },
    });


    return { createDataValuesMutation, deleteDataValuesMutation };
};
