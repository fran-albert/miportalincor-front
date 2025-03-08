import { apiIncor } from "@/services/axiosConfig";

export const getLastPatients = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await apiIncor.get<number>(`Patient/lastPatients`);
    return data;
}