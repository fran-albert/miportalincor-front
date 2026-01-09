import { apiTurnos } from "@/services/axiosConfig";

export interface DoctorPublicInfo {
  userId: number;
  firstName: string;
  lastName: string;
  specialities?: {
    id: number;
    name: string;
  }[];
}

/**
 * Obtener informacion basica de un medico (para pacientes)
 * Solo devuelve: userId, firstName, lastName, specialities
 */
export const getDoctorPublicInfo = async (
  userId: number
): Promise<DoctorPublicInfo | null> => {
  try {
    const { data } = await apiTurnos.get<DoctorPublicInfo>(
      `doctors/public/${userId}`
    );
    return data;
  } catch {
    return null;
  }
};

/**
 * Obtener informacion basica de multiples medicos
 */
export const getDoctorsPublicInfo = async (
  userIds: number[]
): Promise<DoctorPublicInfo[]> => {
  const results = await Promise.all(
    userIds.map((id) => getDoctorPublicInfo(id))
  );
  return results.filter((d): d is DoctorPublicInfo => d !== null);
};
