import { slugify } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { apiIncor } from "@/services/axiosConfig";

interface PatientResponse {
  id: number;
  userId: number;
  affiliationNumber: string;
  user: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    phoneNumber: string;
  };
  healthPlans?: Array<{ name: string }>;
}

export const getPatients = async (search: string): Promise<Patient[]> => {
  const params = search ? { Search: search } : {};

  const { data } = await apiIncor.get(`Patient`, { params });

  return data.data.map((patient: PatientResponse) => ({
    id: patient.id,
    userId: patient.userId,
    firstName: patient.user.firstName,
    lastName: patient.user.lastName,
    userName: patient.user.userName,
    email: patient.user.email,
    phoneNumber: patient.user.phoneNumber,
    affiliationNumber: patient.affiliationNumber,
    slug: slugify(`${patient.user.firstName} ${patient.user.lastName}`, patient.userId),
    healthPlans: patient.healthPlans ? patient.healthPlans.map((plan) => ({ name: plan.name })) : []
  }));
};
