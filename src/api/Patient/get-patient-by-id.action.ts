import { slugify } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { apiIncor } from "@/services/axiosConfig";


export const getPatientById = async (id: number) => {
    // await sleep(2);
    const { data } = await apiIncor.get<Patient>(`Patient/${id}`);
    const slug = slugify(`${data.firstName} ${data.lastName}`, data.userId)
    const patient = {
        ...data,
        slug: slug,
    }
    return patient;
}
