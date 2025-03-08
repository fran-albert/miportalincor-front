import { apiLaboral } from "@/services/axiosConfig";

export interface GetUrlResponseDto {
  url: string;
}

export const getSignedUrlByCollaboratorIdAndFileName = async (
  collaboratorId: number,
  fileName: string
): Promise<GetUrlResponseDto> => {
  const { data } = await apiLaboral.get<GetUrlResponseDto>(
    `file/signed-url?collaboratorId=${collaboratorId}&fileName=${fileName}`
  );
  return data;
};
