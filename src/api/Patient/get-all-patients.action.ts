import { sleep, slugify } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import axiosInstance from "@/services/axiosConfig";

export const getPatients = async (): Promise<Patient[]> => {
    await sleep(2);

    // const params = new URLSearchParams();
    // params.append('page', `${page}`);
    // params.append('per_page', '5');

    const { data } = await axiosInstance.get<Patient[]>(`Patient/all`);
    const patientsWithSlugs = data.map(patient => ({
        ...patient,
        slug: slugify(`${patient.firstName} ${patient.lastName}`, patient.userId)
    }));

    return patientsWithSlugs;
}
