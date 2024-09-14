import axiosInstance from "@/services/axiosConfig";

export const getTotalHealthInsurances = async (): Promise<number> => {
    // await sleep(2);

    const { data } = await axiosInstance.get(`HealthInsurance/all`);
    const totalHealthInsurances = data.length;
    return totalHealthInsurances;
}