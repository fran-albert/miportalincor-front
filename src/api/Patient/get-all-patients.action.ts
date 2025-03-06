import { slugify } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { apiIncor } from "@/services/axiosConfig";

export const getPatients = async (search: string): Promise<Patient[]> => {
  const params = search ? { Search: search } : {};

  const { data } = await apiIncor.get(`Patient`, { params });

  return data.data.map((patient: any) => ({
    id: patient.id,
    userId: patient.userId,
    firstName: patient.user.firstName,
    lastName: patient.user.lastName,
    userName: patient.user.userName,
    email: patient.user.email,
    phoneNumber: patient.user.phoneNumber,
    affiliationNumber: patient.affiliationNumber,
    slug: slugify(`${patient.user.firstName} ${patient.user.lastName}`, patient.userId),
    healthPlans: patient.healthPlans ? patient.healthPlans.map((plan: any) => ({ name: plan.name })) : []
  }));
};
