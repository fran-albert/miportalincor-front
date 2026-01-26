import { apiIncorHC } from "@/services/axiosConfig";

/**
 * Delete a medication item from a green card
 * @param cardId - The green card ID
 * @param itemId - The item ID
 */
export const deleteGreenCardItem = async (
  cardId: string,
  itemId: string
): Promise<void> => {
  await apiIncorHC.delete(`/green-cards/${cardId}/items/${itemId}`);
};
