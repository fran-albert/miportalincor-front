import { Address } from "@/types/Address/Address";
import { Base } from "../Base/Base";
import { Company } from "../Company/Company";
import { HealthInsurance } from "../Health-Insurance/Health-Insurance";

export interface Collaborator extends Base {
  firstName: string;
  lastName: string;
  email: string;
  slug?: string;
  birthDate: Date | string;
  phone: string;
  addressId?: number;
  userName: string;
  gender: string;
  photoUrl: string;
  company: Company;
  addressData?: Address;
  healthInsuranceId?: number;
  healthInsurance?: HealthInsurance;
  positionJob: string
  photoBuffer?: { type: "Buffer"; data: number[] };
  photoDataUrl?: string;
  affiliationNumber?: string;
}

export interface CreateCollaboratorDto {
  firstName: string;
  lastName: string;
  userName: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  idCompany: string;
  positionJob: string
}
