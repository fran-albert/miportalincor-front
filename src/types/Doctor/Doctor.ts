import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { User } from "@/types/User/User";
import { Speciality } from "@/types/Speciality/Speciality";

export interface Doctor extends User {
  matricula: string;
  specialities: Speciality[];
  firma?: string;
  sello?: string;
  healthInsurances: HealthInsurance[];
}
