import { apiIncorHC } from "@/services/axiosConfig";
import type {
  CreateVaccinationApplicationDto,
  UpdateVaccinationApplicationDto,
  VaccinationApplication,
  VaccinationCard,
  VaccinationCatalog,
} from "@/types/Vaccination/Vaccination";

export const getVaccinationCatalog = async (): Promise<VaccinationCatalog> => {
  const { data } =
    await apiIncorHC.get<VaccinationCatalog>("/vaccination-cards/catalog");
  return data;
};

export const getMyVaccinationCard =
  async (): Promise<VaccinationCard | null> => {
    const { data } =
      await apiIncorHC.get<VaccinationCard | null>(
        "/vaccination-cards/my-card"
      );
    return data;
  };

export const getPatientVaccinationCard = async (
  patientUserId: string
): Promise<VaccinationCard> => {
  const { data } = await apiIncorHC.get<VaccinationCard>(
    `/vaccination-cards/patient/${patientUserId}`
  );
  return data;
};

export const createVaccinationApplication = async (
  patientUserId: string,
  dto: CreateVaccinationApplicationDto
): Promise<VaccinationApplication> => {
  const { data } = await apiIncorHC.post<VaccinationApplication>(
    `/vaccination-cards/patient/${patientUserId}/applications`,
    dto
  );
  return data;
};

export const updateVaccinationApplication = async (
  applicationId: string,
  dto: UpdateVaccinationApplicationDto
): Promise<VaccinationApplication> => {
  const { data } = await apiIncorHC.patch<VaccinationApplication>(
    `/vaccination-cards/applications/${applicationId}`,
    dto
  );
  return data;
};

export const deleteVaccinationApplication = async (
  applicationId: string
): Promise<void> => {
  await apiIncorHC.delete(`/vaccination-cards/applications/${applicationId}`);
};
