import { sleep } from "@/common/helpers/helpers";
import { Doctor, CreateDoctorDto } from "@/types/Doctor/Doctor";
import { apiIncorHC } from "@/services/axiosConfig";

export const createDoctor = async (doctor: CreateDoctorDto) => {
    await sleep(2);
    const { data } = await apiIncorHC.post<Doctor>(`/doctor`, doctor);
    return data;
}
