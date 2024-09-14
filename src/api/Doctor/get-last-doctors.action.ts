import axiosInstance from "@/services/axiosConfig";

export const getLastDoctors = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await axiosInstance.get<number>(`Doctor/lastDoctors`);
    return data;
}