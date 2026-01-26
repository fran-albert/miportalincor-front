import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCard, CreateGreenCardItemDto } from "@/types/Green-Card/GreenCard";

/**
 * Add a medication item to a green card
 * @param cardId - The green card ID
 * @param dto - Create green card item DTO
 * @returns The updated green card
 */
export const addGreenCardItem = async (
  cardId: string,
  dto: CreateGreenCardItemDto
): Promise<GreenCard> => {
  const { data } = await apiIncorHC.post<GreenCard>(`/green-cards/${cardId}/items`, dto);
  return data;
};
