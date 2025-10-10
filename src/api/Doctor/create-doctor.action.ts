import { sleep } from "@/common/helpers/helpers";
import { Doctor, CreateDoctorDto } from "@/types/Doctor/Doctor";
import { apiIncor } from "@/services/axiosConfig";

export const createDoctor = async (doctor: CreateDoctorDto) => {
    await sleep(2);
    const { data } = await apiIncor.post<Doctor>(`/Doctor/create`, doctor);
    return data;
}
