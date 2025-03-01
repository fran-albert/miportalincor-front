import { apiIncor } from "@/services/axiosConfig";

export const getLastDoctors = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await apiIncor.get<number>(`Doctor/lastDoctors`);
    return data;
}