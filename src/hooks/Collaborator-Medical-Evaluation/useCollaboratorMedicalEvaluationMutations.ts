import { createCollaboratorMedicalEvaluation } from "@/api/Collaborator-Medical-Evaluation/create-collaborator.medical.evaluation";
import { deleteCollaboratorMedicalEvaluation } from "@/api/Collaborator-Medical-Evaluation/delete-collaborator.medical.evaluation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCollaboratorMedicalEvaluationMutations = () => {
    const queryClient = useQueryClient();

    const addCollaboratorMedicalEvaluationMutation = useMutation({
        mutationFn: createCollaboratorMedicalEvaluation,
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({ queryKey: ['collaborator-medical-evaluation', response.collaborator.id] });
            console.log(response, "created")
        },
        onError: (error) => {
            console.error("Error creating blodTest", error);
        },
    });

    const deleteCollaboratorMedicalEvaluationMutation = useMutation({
        mutationFn: deleteCollaboratorMedicalEvaluation,
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({ queryKey: ['collaborator-medical-evaluation'] });
            console.log(response, "created")
        },
        onError: (error) => {
            console.error("Error creating blodTest", error);
        },
    });

    return { addCollaboratorMedicalEvaluationMutation, deleteCollaboratorMedicalEvaluationMutation };
};

