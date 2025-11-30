import { Address } from "@/types/Address/Address";

export interface User {
  id: string; // UUID from new API
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  slug?: string;
  birthDate: Date | string | undefined | readonly string[];
  phoneNumber: string;
  phoneNumber2: string;
  photo: string;
  token?: string;
  address: Address;
  userName: string;
  userId: number; // Numeric ID from old Healthcare.Api
  registrationDate: Date | string | undefined;
  roles: string[];
  priority: string;
  module: string;
  description: string;
  currentPassword: string;
  password: string;
  registerBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  newPassword: string;
  code: string;
  confirmPassword: string;
  gender: string;
  registeredById: number | string;
  registeredByName: string;
  maritalStatus: string;
  rhFactor: string;
  observations: string;
  bloodType: string;
  active: boolean;
  // healthPlans: HealthPlans[]
  // healtInsurace: HealthInsurance[];
}
