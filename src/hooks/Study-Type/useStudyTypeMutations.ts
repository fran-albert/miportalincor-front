import { createStudyType } from "@/api/Study-Type/create-study-type.action";
import { deleteStudyType } from "@/api/Study-Type/delete-study-type.action";
import { updateStudyType } from "@/api/Study-Type/update-study-type.action";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useStudyTypeMutations = () => {
    const queryClient = useQueryClient();

    const addStudyTypeMutation = useMutation({
        mutationFn: createStudyType,
        onSuccess: (studyType, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['studyTypes'] });
            console.log("studyType created", studyType, variables, context);
        },

        onError: (error, variables, context) => {
            console.log("Error creating studyType", error, variables, context);
        },
    });

    const updateStudyTypeMutation = useMutation({
        mutationFn: ({ id, studyType }: { id: number; studyType: StudyType }) => updateStudyType(id, studyType),
        onSuccess: (studyType, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['studyTypes'] });
            console.log("studyType updated", studyType, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error updating studyType", error, variables, context);
        },
    });

    const deleteStudyTypeMutation = useMutation({
        mutationFn: (id: number) => deleteStudyType(id),
        onSuccess: (studyType, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['studyTypes'] })
            console.log("studyType deleted", studyType, variables, context);
        },
        onError: (error, variables, context) => {
            console.log("Error deleting studyType", error, variables, context);
        },
    });

    return { addStudyTypeMutation, updateStudyTypeMutation, deleteStudyTypeMutation };
};
