import { apiLaboral } from "@/services/axiosConfig";

export interface GetUrlsResponseDto {
    id: number
    url: string
    dataTypeName: string
}

export const getAllStudiesImagesUrlsByCollaboratorAndMedicalEvaluation = async (collaboratorId: number, medicalEvaluationId: number): Promise<GetUrlsResponseDto[]> => {
    const { data } = await apiLaboral.get<GetUrlsResponseDto[]>(`file/studies-images-urls?medicalEvaluationId=${medicalEvaluationId}&collaboratorId=${collaboratorId}`);
    return data;
}
