import { slugify } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { apiIncorHC } from "@/services/axiosConfig";

export interface SearchPatientsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPatientsResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const searchPatients = async (
  params: SearchPatientsParams = {}
): Promise<PaginatedPatientsResponse> => {
  const { search = "", page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  const { data } = await apiIncorHC.get<PaginatedPatientsResponse>(
    `/patient/search?${queryParams.toString()}`
  );

  // Add slugs to patients
  const patientsWithSlugs = data.data.map((patient) => ({
    ...patient,
    slug: slugify(`${patient.firstName} ${patient.lastName}`, parseInt(patient.userId)),
  }));

  return {
    ...data,
    data: patientsWithSlugs,
  };
};
