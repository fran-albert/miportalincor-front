import { User } from "@/types/User/User";
import { Address } from "../Address/Address";

export interface Secretary extends User {
  // Secretary is a User with Role.Secretaria, no additional fields
}

export interface CreateSecretaryDto {
  firstName: string;
  lastName: string;
  userName: string; // DNI
  email?: string;
  phoneNumber?: string;
  phoneNumber2?: string;
  birthDate: string;
  gender?: string;
  maritalStatus?: string;
  bloodType?: string;
  rhFactor?: string;
  photo?: string;
  address?: Omit<Address, 'id'>;
  registeredById: string;
}

export interface UpdateSecretaryDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  phoneNumber2?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  bloodType?: string;
  rhFactor?: string;
  photo?: string;
  address?: Omit<Address, 'id'>;
}
