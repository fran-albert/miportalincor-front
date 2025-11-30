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

export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await apiIncorHC.get<UserResponse[]>(`users`);

  return data.map((user) => ({
    id: user.id,
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    active: user.active,
    roles: user.roles,
  } as User));
};
