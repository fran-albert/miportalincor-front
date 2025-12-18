import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSecretary } from "@/api/Secretary/create-secretary.action";
import { updateSecretary } from "@/api/Secretary/update-secretary.action";
import { deleteSecretary } from "@/api/Secretary/delete-secretary.action";
import { reactivateSecretary } from "@/api/Secretary/reactivate-secretary.action";
import { UpdateSecretaryDto } from "@/types/Secretary/Secretary";

export const useSecretaryMutations = () => {
  const queryClient = useQueryClient();

  const addSecretaryMutation = useMutation({
    mutationFn: createSecretary,
    onSuccess: (secretary, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["secretaries"] });
      console.log("OK", secretary, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error", error, variables, context);
    },
  });

  const updateSecretaryMutation = useMutation({
    mutationFn: ({ id, secretary }: { id: string; secretary: UpdateSecretaryDto }) =>
      updateSecretary(id, secretary),
    onSuccess: (secretary, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["secretary", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["secretaries"] });
      console.log("OK", secretary, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error", error, variables, context);
    },
  });

  const deleteSecretaryMutation = useMutation({
    mutationFn: (id: string) => deleteSecretary(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["secretaries"] });
      console.log("ok", data, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error deleting secretary", error, variables, context);
    },
  });

  const reactivateSecretaryMutation = useMutation({
    mutationFn: (id: string) => reactivateSecretary(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["secretaries"] });
      console.log("Secretary reactivated", data, variables, context);
    },
    onError: (error, variables, context) => {
      console.log("Error reactivating secretary", error, variables, context);
    },
  });

  return {
    addSecretaryMutation,
    updateSecretaryMutation,
    deleteSecretaryMutation,
    reactivateSecretaryMutation,
  };
};
