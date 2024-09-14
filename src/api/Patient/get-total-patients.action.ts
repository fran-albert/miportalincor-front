import axiosInstance from "@/services/axiosConfig";

export const getTotalPatients = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await axiosInstance.get(`Patient/all`);
    const totalPatient = data.length;
    return totalPatient;
}