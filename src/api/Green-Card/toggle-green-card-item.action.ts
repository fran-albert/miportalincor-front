import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCard } from "@/types/Green-Card/GreenCard";

/**
 * Toggle active/suspended status of a medication item
 * @param cardId - The green card ID
 * @param itemId - The item ID
 * @returns The updated green card
 */
export const toggleGreenCardItem = async (
  cardId: string,
  itemId: string
): Promise<GreenCard> => {
  const { data } = await apiIncorHC.patch<GreenCard>(
    `/green-cards/${cardId}/items/${itemId}/toggle-active`
  );
  return data;
};
