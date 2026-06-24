import { apiIncorHC } from "@/services/axiosConfig";

export interface StaffUserRole {
  id: number;
  name: string;
}

export interface StaffUser {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  userName?: string;
  active?: boolean;
  roles: StaffUserRole[];
}

export interface PaginatedStaffUsers {
  data: StaffUser[];
  total: number;
  page: number;
  limit: number;
}

export interface GetStaffUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getStaffUsers = async (
  params: GetStaffUsersParams = {}
): Promise<PaginatedStaffUsers> => {
  const { page = 1, limit = 20, search } = params;
  const response = await apiIncorHC.get<PaginatedStaffUsers>("/users/staff", {
    params: {
      page,
      limit,
      ...(search && search.trim() ? { search: search.trim() } : {}),
    },
  });
  return response.data;
};
