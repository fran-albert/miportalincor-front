import { apiIncorHC } from "@/services/axiosConfig";

export interface UpdateDataValueDto {
  id?: string;
  idDataType: string;
  value: string;
  observaciones?: string;
}

export interface UpdateEvolutionDto {
  dataValues?: UpdateDataValueDto[];
}

export interface UpdateEvolutionResponse {
  id: string;
  idUserHistoriaClinica: string;
  createdAt: string;
  updatedAt: string;
  dataValues: Array<{
    id: string;
    value: string;
    observaciones?: string;
    dataType: {
      id: string;
      name: string;
      category: string;
    };
  }>;
}

export const updateEvolutionHC = async (
  evolutionId: string,
  values: UpdateEvolutionDto
): Promise<UpdateEvolutionResponse> => {
  const { data } = await apiIncorHC.put<UpdateEvolutionResponse>(
    `user-evolution/${evolutionId}`,
    values
  );
  return data;
};
