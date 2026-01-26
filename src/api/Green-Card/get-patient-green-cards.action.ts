import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCard } from "@/types/Green-Card/GreenCard";

/**
 * Get a patient's green card (for doctors viewing patient's card)
 * @param patientUserId - The patient's user ID
 * @returns The patient's green card or null
 */
export const getPatientGreenCard = async (patientUserId: string): Promise<GreenCard | null> => {
  const { data } = await apiIncorHC.get<GreenCard | null>(`/green-cards/patient/${patientUserId}`);
  return data;
};
