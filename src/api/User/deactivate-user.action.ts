import { User } from "@/types/User/User";
import { apiIncorHC } from "@/services/axiosConfig";

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

export const deactivateUser = async (userId: string): Promise<User> => {
  const { data } = await apiIncorHC.patch<UserResponse>(`users/${userId}/deactivate`);

  return {
    id: data.id,
    userId: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    userName: data.userName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    active: data.active,
    roles: data.roles,
  } as User;
};
