import axiosInstance from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";
import { Lab } from "@/types/Lab/Lab";

export const getLabsDetail = async (idStudies: number[]) => {
    await sleep(2);
    
    const queryString = idStudies.map(id => `studiesId=${id}`).join('&');
    const url = `Study/laboratoryDetails/byStudies?${queryString}`;
    
    const { data } = await axiosInstance.get<Lab[]>(url);
    return data;
}
