import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCard } from "@/types/Green-Card/GreenCard";

/**
 * Get a specific green card by ID
 * @param cardId - The green card ID
 * @returns The green card
 */
export const getGreenCardById = async (cardId: string): Promise<GreenCard> => {
  const { data } = await apiIncorHC.get<GreenCard>(`/green-cards/${cardId}`);
  return data;
};
