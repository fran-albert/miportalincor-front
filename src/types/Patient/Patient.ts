import { User } from "@/types/User/User";

export interface Patient extends User {
  cuil: string;
  dni: string;
  affiliationNumber: string;
  healthPlans: {
    id: number;
    name: string;
    healthInsurance: {
      id: number;
      name: string;
    };
  }[] | null;
}
