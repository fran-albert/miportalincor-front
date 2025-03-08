import { deleteStudy } from "@/api/Study/delete-study.action";
import { uploadStudy } from "@/api/Study/upload-study.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Study } from "@/types/Study/Study";

export const useStudyMutations = () => {
    const queryClient = useQueryClient();

    const uploadStudyMutation = useMutation({
        mutationFn: uploadStudy,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['studiesByUserId', variables.idUser] });

            const previousStudies = queryClient.getQueryData<Study[]>(['studiesByUserId', variables.idUser]);

            const optimisticStudy: Study = {
                id: Math.random(),
                studyType: {
                    id: variables.formData.get('StudyTypeId') as string,
                    name: "Ecografía"
                },
                locationS3: "temp-location.pdf",
                note: variables.formData.get('Note') as string,
                date: variables.formData.get('Date') as string,
                ultrasoundImages: [],
                isOptimistic: true,
                isUpdating: true,
            };

            queryClient.setQueryData<Study[]>(['studiesByUserId', variables.idUser], (oldStudies) => [
                ...(oldStudies || []),
                optimisticStudy,
            ]);

            return { previousStudies };
        },

        onError: (error, variables, context) => {
            if (context?.previousStudies) {
                queryClient.setQueryData(['studiesByUserId', variables.idUser], context.previousStudies);
            }
            console.error("Error creating study", error);
        },
        onSettled: (variables) => {
            queryClient.invalidateQueries({ queryKey: ['studiesByUserId', variables?.id] });
            queryClient.invalidateQueries({ queryKey: ['studyAndImageUrls', variables?.id] });

        },
    });

    const deleteStudyMutation = useMutation({
        mutationFn: (id: number) => deleteStudy(id),
        onSuccess: (patient, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['studiesByUserId'] });
            console.log("Study deleted", patient, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting Study", error, variables, context);
        },
    });

    return { uploadStudyMutation, deleteStudyMutation, };
};
