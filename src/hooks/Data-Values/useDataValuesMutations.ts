import { createDataValues } from "@/api/Data-Values/create-data-values.action";
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

    return { createDataValuesMutation };
};
