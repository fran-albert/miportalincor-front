import axiosInstance from "@/services/axiosConfig";
import { sleep, slugify } from "@/common/helpers/helpers";
import { Doctor } from "@/types/Doctor/Doctor";

export const getDoctorById = async (id: number) => {
    await sleep(2);
    const { data } = await axiosInstance.get<Doctor>(`Doctor/${id}`);
    const slug = slugify(`${data.firstName} ${data.lastName}`, data.userId)
    const doctor = {
        ...data,
        slug: slug,
    }
    return doctor;
}
