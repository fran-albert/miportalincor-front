import { createEvolutionHC } from "@/api/Evolution/create-evolution";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useEvolutionMutation = () => {
    const queryClient = useQueryClient();

    const createEvolutionMutation = useMutation({
        mutationFn: createEvolutionHC,
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

    return { createEvolutionMutation };
};