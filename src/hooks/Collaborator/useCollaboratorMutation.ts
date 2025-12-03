import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCollaborator } from "@/api/Collaborator/delete-collaborator.action";
import { createCollaborator } from "@/api/Collaborator/create-collaborator.action";
import { updateCollaborator } from "@/api/Collaborator/update-collaborator.action";

export const useCollaboratorMutations = () => {
  const queryClient = useQueryClient();

  const addCollaboratorMutation = useMutation({
    mutationFn: createCollaborator,
    onSuccess: (collaborator, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] })
      queryClient.invalidateQueries({ queryKey: ['collaborators-by-company'] })
      console.log("OK", collaborator, variables, context);
    },

    onError: (error, variables, context) => {
      console.log("Error", error, variables, context);
    },
  });

  const updateCollaboratorMutation = useMutation({
    mutationFn: async ({
      id,
      collaborator,
    }: {
      id: number;
      collaborator: FormData;
    }) => {
      return await updateCollaborator(id, collaborator);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['collaborator', variables.id] });
      console.log('Actualización exitosa:', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Error al actualizar el colaborador:', error, variables, context);
    },
  });
  
  const deleteCollaboratorMutation = useMutation({
    mutationFn: (id: number) => deleteCollaborator(id),
    onSuccess: (collaborator, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] })
      queryClient.invalidateQueries({ queryKey: ['collaborators-by-company'] })
      console.log("collaborator deleted", collaborator, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error deleting collaborator", error, variables, context);
    },
  });



  return { addCollaboratorMutation, updateCollaboratorMutation, deleteCollaboratorMutation };
};
