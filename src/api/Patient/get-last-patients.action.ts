import axiosInstance from "@/services/axiosConfig";

export const getLastPatients = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await axiosInstance.get<number>(`Patient/lastPatients`);
    return data;
}