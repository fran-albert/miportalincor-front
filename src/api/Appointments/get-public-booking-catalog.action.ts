import { apiTurnos } from "@/services/axiosConfig";

export interface PublicAppointmentSpeciality {
  id: number;
  name: string;
}

export interface PublicAppointmentDoctor {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  providerName?: string;
}

export interface PublicAppointmentSlot {
  id: number;
  description?: string;
  time: string;
  date: string;
  providerName?: string;
  providerId: number;
}

export const getPublicAppointmentSpecialities = async (): Promise<PublicAppointmentSpeciality[]> => {
  const { data } = await apiTurnos.get<PublicAppointmentSpeciality[]>("public/specialities");
  return data;
};

export const getPublicDoctorsBySpeciality = async (
  specialityId: number,
): Promise<PublicAppointmentDoctor[]> => {
  const { data } = await apiTurnos.get<PublicAppointmentDoctor[]>(
    `public/doctors/by-speciality/${specialityId}`,
  );
  return data;
};

export const getPublicAvailableSlotsBySpeciality = async (
  specialityId: number,
): Promise<PublicAppointmentSlot[]> => {
  const { data } = await apiTurnos.get<PublicAppointmentSlot[]>(
    `public/available-slots/${specialityId}`,
  );
  return data;
};
