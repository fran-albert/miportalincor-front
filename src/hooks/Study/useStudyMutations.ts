import { deleteStudy } from "@/api/Study/delete-study.action";
import { uploadStudy } from "@/api/Study/upload-study.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useStudyMutations = () => {
    const queryClient = useQueryClient();
    const uploadStudyMutation = useMutation({
        mutationFn: uploadStudy,
        onSuccess: (patient, variables, context) => {
            const userId = Number(variables.get("userId"));
            queryClient.invalidateQueries({
                queryKey: ["studies-by-user-id", { userId }]
            });
            console.log("Study created", patient, variables, context);
        },

        onError: (error: unknown, variables, context) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const responseData = (error as { response?: { data?: unknown } }).response?.data;
            console.log("Error details:", responseData || errorMessage, variables, context);
        },

    });

    const deleteStudyMutation = useMutation({
        mutationFn: ({ studyId }: { studyId: number, userId: number }) => deleteStudy(studyId),
        onSuccess: (patient, variables, context) => {
            const id = variables.userId
            queryClient.invalidateQueries({
                queryKey: ["studies-by-user-id", { id }]
            });

            console.log("Study deleted", patient, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting Study", error, variables, context);
        },
    });

    return { uploadStudyMutation, deleteStudyMutation, };
};
