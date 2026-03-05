import { apiIncorHC } from "@/services/axiosConfig";
import { BatchRequestResult } from "@/types/Green-Card/GreenCard";

/**
 * Request prescriptions for multiple medication items at once (patient only)
 * Items are grouped by doctor automatically
 * @param cardId - The green card ID
 * @param itemIds - Array of item IDs to request prescriptions for
 */
export const batchRequestPrescription = async (
  cardId: string,
  itemIds: string[]
): Promise<BatchRequestResult> => {
  const { data } = await apiIncorHC.post<BatchRequestResult>(
    `/green-cards/${cardId}/batch-request-prescription`,
    { itemIds }
  );
  return data;
};
