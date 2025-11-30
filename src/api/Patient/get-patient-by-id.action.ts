import { slugify } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { apiIncorHC } from "@/services/axiosConfig";


export const getPatientById = async (id: string) => {
    // id can be either UUID or numeric userId
    // If it's a number (from slug), use by-user-id endpoint
    // If it's a UUID, use regular endpoint
    const isNumeric = /^\d+$/.test(id);
    const endpoint = isNumeric ? `patient/by-user-id/${id}` : `patient/${id}`;
    const { data } = await apiIncorHC.get<Patient>(endpoint);
    const slug = slugify(`${data.firstName} ${data.lastName}`, data.userId)
    const patient = {
        ...data,
        slug: slug,
    }
    return patient;
}
