import axiosInstance from "@/services/axiosConfig";

export const getTotalDoctors = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await axiosInstance.get(`Doctor/all`);
    const totalDoctors = data.length;
    return totalDoctors;
}