import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvolution } from "@/api/Evolutions/Collaborator/create-evolution.action";
import { deleteEvolution } from "@/api/Evolutions/Collaborator/delete-evolution.action";

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

    const deleteEvolutionMutation = useMutation({
        mutationFn: deleteEvolution,
        onSuccess: async (response, variables) => {
            // Invalidate the evolutions query for all collaborators
            await queryClient.invalidateQueries({
                queryKey: ['evolutions']
            });
            console.log("Evolution deleted successfully", response, variables);
        },
        onError: (error) => {
            console.error("Error deleting evolution:", error);
        },
    });

    return { createEvolutionMutation, deleteEvolutionMutation };
};