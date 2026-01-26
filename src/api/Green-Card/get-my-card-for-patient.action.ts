import { apiIncorHC } from "@/services/axiosConfig";
import { GreenCard } from "@/types/Green-Card/GreenCard";

/**
 * Get or create a patient's green card (for doctors to add medications)
 * @param patientUserId - The patient's user ID
 * @returns The patient's green card (creates if doesn't exist)
 */
export const getOrCreatePatientCard = async (patientUserId: string): Promise<GreenCard> => {
  const { data } = await apiIncorHC.get<GreenCard>(`/green-cards/patient/${patientUserId}/get-or-create`);
  return data;
};
