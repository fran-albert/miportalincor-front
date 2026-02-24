import { apiTurnos } from '@/services/axiosConfig';

export const deleteDoctorConsultationTypeSetting = async (id: number): Promise<void> => {
  await apiTurnos.delete(`doctor-consultation-type-settings/${id}`);
};
