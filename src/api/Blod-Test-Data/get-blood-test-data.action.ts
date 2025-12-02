import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";

export const getBloodTestData = async (idStudies: string[]) => {
    if (!idStudies || idStudies.length === 0) {
        return [];
    }

    const queryString = idStudies.map(id => `studiesIds=${id}`).join('&');
    const url = `blood-test-data/byStudies?${queryString}`;

    const { data } = await apiIncorHC.get<BloodTestData[]>(url);

    return data;
}
