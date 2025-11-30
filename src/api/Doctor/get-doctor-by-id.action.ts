import { apiIncorHC } from "@/services/axiosConfig";
import { sleep, slugify } from "@/common/helpers/helpers";
import { Doctor } from "@/types/Doctor/Doctor";

export const getDoctorById = async (id: string) => {
    await sleep(2);
    // id can be either UUID or numeric userId
    // If it's a number (from slug), use by-user-id endpoint
    // If it's a UUID, use regular endpoint
    const isNumeric = /^\d+$/.test(id);
    const endpoint = isNumeric ? `doctor/by-user-id/${id}` : `doctor/${id}`;
    const { data } = await apiIncorHC.get<Doctor>(endpoint);
    const slug = slugify(`${data.firstName} ${data.lastName}`, data.userId)
    const doctor = {
        ...data,
        slug: slug,
    }
    return doctor;
}
