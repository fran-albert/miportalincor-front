import { apiIncorHC } from "@/services/axiosConfig";
import { Role } from "./get-all-roles.action";

export const getUserRoles = async (userId: string): Promise<Role[]> => {
  const response = await apiIncorHC.get<Role[]>(`/users/${userId}/roles`);
  return response.data;
};
