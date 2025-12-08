import { apiIncorHC } from "@/services/axiosConfig";
import { City } from "@/types/City/City";

export const getCityByState = async (idState: number): Promise<City[]> => {
    // await sleep(2);
    const { data } = await apiIncorHC.get<City[]>(`city/by-state/${idState}`);
    return data
}
