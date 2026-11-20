import { slugify } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import { Doctor } from "@/types/Doctor/Doctor";

type InactiveDoctorsResponse = Doctor[] | { data: Doctor[] };

export const getInactiveDoctors = async (): Promise<Doctor[]> => {
  const { data } = await apiIncorHC.get<InactiveDoctorsResponse>("doctor/inactive");
  const doctors = Array.isArray(data) ? data : data.data ?? [];
  return doctors.map((doctor) => ({
    ...doctor,
    slug: slugify(`${doctor.firstName} ${doctor.lastName}`, doctor.id),
  }));
};
