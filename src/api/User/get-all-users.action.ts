import { User } from "@/types/User/User";
import { apiIncorHC } from "@/services/axiosConfig";

export type UserStatusFilter = "active" | "inactive" | "all";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatusFilter;
}

interface UserResponse {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  active: boolean;
  roles: string[];
}

interface PaginatedUsersResponse {
  items: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export const getAllUsers = async (
  params: GetUsersParams = {}
): Promise<PaginatedUsers> => {
  const { page = 1, limit = 20, search = "", status = "active" } = params;

  const { data } = await apiIncorHC.get<PaginatedUsersResponse>(`users`, {
    params: {
      page,
      limit,
      status,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
  });

  return {
    users: data.items.map(
      (user) =>
        ({
          id: user.id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          active: user.active,
          roles: user.roles,
        } as User)
    ),
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};
