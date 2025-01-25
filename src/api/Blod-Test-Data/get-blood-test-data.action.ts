import axiosInstance from "@/services/axiosConfig";
import { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";

export const getBloodTestData = async (idStudies: number[]) => {
    const queryString = idStudies.map(id => `studiesIds=${id}`).join('&');
    const url = `BloodTestData/byStudies?${queryString}`;
    
    const { data } = await axiosInstance.get<BloodTestData[]>(url);

    return data;
}
