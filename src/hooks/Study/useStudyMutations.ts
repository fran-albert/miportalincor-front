import { deleteStudy } from "@/api/Study/delete-study.action";
import { uploadStudy } from "@/api/Study/upload-study.action";
import { uploadExternalStudy } from "@/api/Study/upload-external-study.action";
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
        mutationFn: ({ studyId }: { studyId: number, userId: number }) => deleteStudy(String(studyId)),
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

    const uploadExternalStudyMutation = useMutation({
        mutationFn: uploadExternalStudy,
        onSuccess: (_data, variables) => {
            const userId = Number(variables.get("userId"));
            queryClient.invalidateQueries({
                queryKey: ["studies-by-user-id", { userId }]
            });
            console.log("External study created successfully");
        },
        onError: (error: unknown, variables, context) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const responseData = (error as { response?: { data?: unknown } }).response?.data;
            console.log("Error creating external study:", responseData || errorMessage, variables, context);
        },
    });

    return { uploadStudyMutation, deleteStudyMutation, uploadExternalStudyMutation };
};
