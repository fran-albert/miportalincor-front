import { slugify } from "@/common/helpers/helpers";
import { Doctor } from "@/types/Doctor/Doctor";
import { apiIncorHC } from "@/services/axiosConfig";

export interface SearchDoctorsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDoctorsResponse {
  data: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const searchDoctors = async (
  params: SearchDoctorsParams = {}
): Promise<PaginatedDoctorsResponse> => {
  const { search = "", page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  const { data } = await apiIncorHC.get<PaginatedDoctorsResponse>(
    `/doctor/search?${queryParams.toString()}`
  );

  // Add slugs to doctors
  const doctorsWithSlugs = data.data.map((doctor) => ({
    ...doctor,
    slug: slugify(`${doctor.firstName} ${doctor.lastName}`, doctor.userId),
  }));

  return {
    ...data,
    data: doctorsWithSlugs,
  };
};
