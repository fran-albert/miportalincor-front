import { apiIncorHC } from "@/services/axiosConfig";

/**
 * Request a prescription for a medication item (patient only)
 * @param cardId - The green card ID
 * @param itemId - The item ID
 */
export const requestPrescription = async (
  cardId: string,
  itemId: string
): Promise<void> => {
  await apiIncorHC.post(`/green-cards/${cardId}/items/${itemId}/request-prescription`);
};
