import { apiIncorHC } from "@/services/axiosConfig";

export interface Role {
  id: number;
  name: string;
}

export const getAllRoles = async (): Promise<Role[]> => {
  const response = await apiIncorHC.get<Role[]>("/roles");
  return response.data;
};
