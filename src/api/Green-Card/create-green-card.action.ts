import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCard, CreateGreenCardDto } from "@/types/Green-Card/GreenCard";

/**
 * Create a new green card for a patient (doctor only)
 * @param dto - Create green card DTO
 * @returns The created green card
 */
export const createGreenCard = async (dto: CreateGreenCardDto): Promise<GreenCard> => {
  const { data } = await apiIncorHC.post<GreenCard>("/green-cards", dto);
  return data;
};
