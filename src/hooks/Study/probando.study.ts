import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { uploadStudy } from "@/api/Study/upload-study.action";
import { StudyType } from "@/types/Study-Type/Study-Type";

// Definición de tipos
interface StudyResponse {
    id: number;
    locationS3: string;
    studyTypeId: number;
    studyType: null | string;
    date: string;
    note: string;
    created: string;
    signedUrl: string;
    ultrasoundImages: null | any[];
}

interface ErrorResponse {
    message: string;
    status: number;
}


export const useUploadStudy = () => {
    const queryClient = useQueryClient();

    return useMutation<StudyResponse, AxiosError<ErrorResponse>, FormData>({
        mutationFn: uploadStudy,
        onSuccess: (newStudy, variables) => {
            const userId = parseInt(variables.get('UserId') as string);
            const studyTypeId = parseInt(variables.get('StudyTypeId') as string);

            // Get studyTypes from the cache
            const studyTypes = queryClient.getQueryData(['studyTypes']) as StudyType[] || [];

            // Find the matching study type
            const matchingStudyType = studyTypes.find(type => type.id === studyTypeId);

            // Ensure we have the study type name
            const studyTypeObject = matchingStudyType
                ? { id: matchingStudyType.id, name: matchingStudyType.name }
                : { id: studyTypeId, name: `Tipo ${studyTypeId}` };

            // Enrich the new study with the proper study type object
            const enrichedStudy = {
                ...newStudy,
                studyType: studyTypeObject
            };

            // Logging for debugging
            console.log('Study Type ID:', studyTypeId);
            console.log('Matching Study Type:', matchingStudyType);
            console.log('Enriched Study:', enrichedStudy);

            queryClient.setQueryData(
                ['studiesByUserId', userId],
                (oldData: any[]) => {
                    if (!oldData) return [enrichedStudy];
                    return [...oldData, enrichedStudy];
                }
            );

            queryClient.invalidateQueries({
                queryKey: ['studyAndImageUrls'],
                refetchType: 'active'
            });

            return enrichedStudy;
        },

        onError: (error: AxiosError<ErrorResponse>) => {
            console.error('Error al subir estudio:', error);
        },
    });
};
