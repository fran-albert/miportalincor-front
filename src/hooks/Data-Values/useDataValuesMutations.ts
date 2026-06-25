import { createDataValues, createDataValuesHC } from "@/api/Data-Values/create-data-values.action";
import { deleteDataValue, deleteDataValuesHC } from "@/api/Data-Values/delete-data-value.action";
import { updateDataValueHC } from "@/api/Data-Values/update-data-value.action";
import { UpdateDataValueHCDto } from "@/types/Data-Value/Data-Value";
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

    const createDataValuesHCMutation = useMutation({
        mutationFn: createDataValuesHC,
        onSuccess: (dataValues, variables, context) => {
            // Invalidate all historia-clinica queries to refresh antecedentes, medicacion-actual, and evoluciones
            queryClient.invalidateQueries({
                queryKey: ['historia-clinica'],
                type: 'all'
            });
            console.log("HC data values created", dataValues, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating HC data values", error, variables, context);
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

    const deleteDataValuesHCMutation = useMutation({
        mutationFn: (id: string) => deleteDataValuesHC(id),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["historia-clinica"] });
            console.log("ok", data, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting patient", error, variables, context);
        },
    });

    const updateDataValuesHCMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDataValueHCDto }) =>
            updateDataValueHC(id, data),
        onSuccess: (dataValue, variables, context) => {
            // Invalidate historia-clinica queries to refresh antecedentes
            queryClient.invalidateQueries({
                queryKey: ['historia-clinica'],
                type: 'all'
            });
            console.log("Data value updated", dataValue, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating data value", error, variables, context);
        },
    });


    return { createDataValuesMutation, createDataValuesHCMutation, deleteDataValuesMutation, deleteDataValuesHCMutation, updateDataValuesHCMutation };
};
