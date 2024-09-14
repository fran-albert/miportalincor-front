import axiosInstance from "@/services/axiosConfig";
import { City } from "@/types/City/City";

export const getCityByState = async (idState: number): Promise<City[]> => {
    // await sleep(2);
    const { data } = await axiosInstance.get<City[]>(`City/byState/${idState}`);
    return data
}
