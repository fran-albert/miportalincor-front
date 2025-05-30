import { apiIncor } from "@/services/axiosConfig";

export const getTotalPatients = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await apiIncor.get(`Patient/all`);
    const totalPatient = data.length;
    return totalPatient;
}