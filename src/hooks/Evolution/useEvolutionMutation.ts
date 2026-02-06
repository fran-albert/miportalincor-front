import { createEvolutionHC } from "@/api/Evolution/create-evolution";
import { deleteEvolutionHC } from "@/api/Evolution/delete-evolution";
import { updateEvolutionHC, UpdateEvolutionDto } from "@/api/Evolution/update-evolution";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateEvolutionVariables {
    evolutionId: string;
    data: UpdateEvolutionDto;
}

export const useEvolutionMutation = () => {
    const queryClient = useQueryClient();

    const createEvolutionMutation = useMutation({
        mutationFn: createEvolutionHC,
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        onSuccess: (data, variables, context) => {
            // Invalidate all historia-clinica queries to refresh evoluciones
            queryClient.invalidateQueries({
                queryKey: ['historia-clinica'],
                type: 'all'
            });
            console.log("Evolution created successfully", data, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error creating evolution", error, variables, context);
        },
    });

    const updateEvolutionMutation = useMutation({
        mutationFn: ({ evolutionId, data }: UpdateEvolutionVariables) =>
            updateEvolutionHC(evolutionId, data),
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        onSuccess: (data, variables, context) => {
            // Invalidate all historia-clinica queries to refresh evoluciones
            queryClient.invalidateQueries({
                queryKey: ['historia-clinica'],
                type: 'all'
            });
            console.log("Evolution updated successfully", data, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating evolution", error, variables, context);
        },
    });

    const deleteEvolutionMutation = useMutation({
        mutationFn: deleteEvolutionHC,
        onSuccess: (data, variables, context) => {
            // Invalidate all historia-clinica queries to refresh evoluciones
            queryClient.invalidateQueries({
                queryKey: ['historia-clinica'],
                type: 'all'
            });
            console.log("Evolution deleted successfully", data, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting evolution", error, variables, context);
        },
    });

    return { createEvolutionMutation, updateEvolutionMutation, deleteEvolutionMutation };
};