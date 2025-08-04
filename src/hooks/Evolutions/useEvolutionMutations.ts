import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvolution } from "@/api/Evolutions/Collaborator/create-evolution.action";

export const useEvolutionMutations = () => {
    const queryClient = useQueryClient();

    const createEvolutionMutation = useMutation({
        mutationFn: createEvolution,
        onSuccess: async (response, variables) => {
            // Invalidate the evolutions query for the specific collaborator
            await queryClient.invalidateQueries({ 
                queryKey: ['evolutions', variables.collaboratorId] 
            });
            console.log(response, "evolution created");
        },
        onError: (error) => {
            console.error("Error creating evolution:", error);
        },
    });

    return { createEvolutionMutation };
};