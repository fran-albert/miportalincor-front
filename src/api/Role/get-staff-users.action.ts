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

export const getStaffUsers = async (): Promise<StaffUser[]> => {
  const response = await apiIncorHC.get<StaffUser[]>("/users/staff");
  return response.data;
};
