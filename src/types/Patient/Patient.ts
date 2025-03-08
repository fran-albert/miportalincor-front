import { User } from "@/types/User/User";
import { Address } from "../Address/Address";
import { HealthPlans } from "../Health-Plans/HealthPlan";

export interface Patient extends User {
  cuil: string;
  dni: string;
  affiliationNumber: string;
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
