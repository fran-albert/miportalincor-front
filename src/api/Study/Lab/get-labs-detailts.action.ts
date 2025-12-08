import { apiIncorHC } from "@/services/axiosConfig";
import { Lab } from "@/types/Lab/Lab";

export const getLabsDetail = async (idStudies: string[]) => {
    const queryString = idStudies.map(id => `studiesIds=${id}`).join('&');
    const url = `blood-test-data/byStudies?${queryString}`;

    const { data } = await apiIncorHC.get<Lab[]>(url);
    return data;
}
