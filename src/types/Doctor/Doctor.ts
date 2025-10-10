import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { User } from "@/types/User/User";
import { Speciality } from "@/types/Speciality/Speciality";
import { Address } from "../Address/Address";

export interface Doctor extends User {
  matricula: string;
  specialities: Speciality[];
  firma?: string;
  sello?: string;
  healthInsurances: HealthInsurance[];
}

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  phoneNumber2?: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  matricula: string;
  bloodType?: string;
  rhFactor?: string;
  observations?: string;
  photo?: string;
  specialities: Array<{ id: number; name: string }>;
  healthInsurances: Array<{ id: number; name: string }>;
  address: Omit<Address, 'id'>;
  registeredById: number;
}
