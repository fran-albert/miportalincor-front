import { apiIncor } from "@/services/axiosConfig";

export const getTotalSpecialities = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await apiIncor.get(`speciality/all`);
    const totalSpecialities = data.length;
    return totalSpecialities;
}