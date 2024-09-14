import axiosInstance from "@/services/axiosConfig";

export const getTotalSpecialities = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await axiosInstance.get(`speciality/all`);
    const totalSpecialities = data.length;
    return totalSpecialities;
}