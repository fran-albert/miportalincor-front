import { apiIncorHC } from "@/services/axiosConfig";

export const removeRoleFromUser = async (userId: string, roleId: number): Promise<void> => {
  await apiIncorHC.delete(`/users/${userId}/roles/${roleId}`);
};
