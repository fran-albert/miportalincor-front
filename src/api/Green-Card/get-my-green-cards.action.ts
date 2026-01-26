import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCard } from "@/types/Green-Card/GreenCard";

/**
 * Get the authenticated patient's green card (single card per patient)
 * @returns The patient's green card or null if none exists
 */
export const getMyGreenCard = async (): Promise<GreenCard | null> => {
  const { data } = await apiIncorHC.get<GreenCard | null>("/green-cards/my-card");
  return data;
};
