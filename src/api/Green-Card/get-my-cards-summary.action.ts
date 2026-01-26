import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCardSummary } from "@/types/Green-Card/GreenCard";

/**
 * Get summary of patient's green card
 * @returns Summary with medication counts
 */
export const getMyCardSummary = async (): Promise<GreenCardSummary | null> => {
  const { data } = await apiIncorHC.get<GreenCardSummary | null>("/green-cards/my-card/summary");
  return data;
};
