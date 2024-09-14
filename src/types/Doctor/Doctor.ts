import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { User } from "@/types/User/User";


export interface Doctor extends User {
  matricula: string;
  specialities: any[];
  healthInsurances: HealthInsurance[];
}