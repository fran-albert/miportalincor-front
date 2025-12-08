import { apiIncorHC } from "@/services/axiosConfig";
import { State } from "@/types/State/State";

export const getStates = async (): Promise<State[]> => {
    // await sleep(2);
    const { data } = await apiIncorHC.get<State[]>(`state`);
    return data
}
