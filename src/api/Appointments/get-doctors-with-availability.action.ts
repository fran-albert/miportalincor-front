import { apiTurnos } from "@/services/axiosConfig";

export const getDoctorsWithAvailability = async (): Promise<number[]> => {
  const { data } = await apiTurnos.get<number[]>(
    "doctor-availability/doctors-with-availability"
  );
  return data;
};
