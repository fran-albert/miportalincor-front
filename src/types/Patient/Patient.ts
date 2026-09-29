import { User } from "@/types/User/User";
import { Address } from "../Address/Address";
import { HealthPlans } from "../Health-Plans/HealthPlan";

export type RegistrationSource = "STAFF" | "SELF_SIGNUP";

export interface Patient extends User {
  cuil: string;
  dni: string;
  affiliationNumber: string;
  /** SELF_SIGNUP: se registró solo en Mi Portal y recepción lo verifica. */
  registrationSource?: RegistrationSource;
  /** Cuándo recepción verificó los datos del autoregistrado. */
  verifiedAt?: string | null;
  healthPlans:
    | {
        id: number;
        name: string;
        healthInsurance: {
          id: number;
          name: string;
        };
      }[]
    | null;
}

export interface CreatePatienDto {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: Date;
  photo: string;
  address: Address;
  healthPlans: HealthPlans[];
  registeredById: number;
  cuil: string;
  cuit: string;
  phoneNumber2: string;
  bloodType: string;
  rhFactor: string;
  maritalStatus: string;
  affiliationNumber: string;
  gender: string;
  observations: string;
}
