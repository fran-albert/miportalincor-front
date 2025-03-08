import { apiLaboral } from "@/services/axiosConfig";

export interface GetUrlsResponseDto {
    url: string
    dataTypeName: string
}

export const getAllUrlsByCollaboratorAndMedicalEvaluation = async (collaboratorId: number, medicalEvaluationId: number): Promise<GetUrlsResponseDto[]> => {
    const { data } = await apiLaboral.get<GetUrlsResponseDto[]>(`file/urls?medicalEvaluationId=${medicalEvaluationId}&collaboratorId=${collaboratorId}`);
    return data;
}
