import axiosInstance from "@/services/axiosConfig";

export const getTotalBlodTests = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await axiosInstance.get(`BloodTest/all`);
    const totalBlodTests = data.length;
    return totalBlodTests;
}