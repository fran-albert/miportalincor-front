import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDoctor } from "@/api/Doctor/update-doctor.action";
import { Doctor } from "@/types/Doctor/Doctor";
import { deleteCollaborator } from "@/api/Collaborator/delete-collaborator.action";
import { createCollaborator } from "@/api/Collaborator/create-collaborator.action";

export const useCollaboratorMutations = () => {
  const queryClient = useQueryClient();

  const addCollaboratorMutation = useMutation({
    mutationFn: createCollaborator,
    onSuccess: (collaborator, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] })
      console.log("OK", collaborator, variables, context);
    },

    onError: (error, variables, context) => {
      console.log("Error", error, variables, context);
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, doctor }: { id: number; doctor: Doctor }) => updateDoctor(id, doctor),
    onSuccess: (doctor, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.id] })
      console.log("OK", doctor, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error", error, variables, context);
    },
  });

  const deleteCollaboratorMutation = useMutation({
    mutationFn: (id: number) => deleteCollaborator(id),
    onSuccess: (collaborator, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] })
      console.log("collaborator deleted", collaborator, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error deleting collaborator", error, variables, context);
    },
  });



  return { addCollaboratorMutation, updateDoctorMutation, deleteCollaboratorMutation };
};
