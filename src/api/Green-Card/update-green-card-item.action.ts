import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCard, UpdateGreenCardItemDto } from "@/types/Green-Card/GreenCard";

/**
 * Update a medication item in a green card
 * @param cardId - The green card ID
 * @param itemId - The item ID
 * @param dto - Update green card item DTO
 * @returns The updated green card
 */
export const updateGreenCardItem = async (
  cardId: string,
  itemId: string,
  dto: UpdateGreenCardItemDto
): Promise<GreenCard> => {
  const { data } = await apiIncorHC.patch<GreenCard>(
    `/green-cards/${cardId}/items/${itemId}`,
    dto
  );
  return data;
};
