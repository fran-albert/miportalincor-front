import { apiIncorHC } from "@/services/axiosConfig";

export const assignRoleToUser = async (userId: string, roleId: number): Promise<void> => {
  await apiIncorHC.post(`/users/${userId}/roles/${roleId}`);
};
