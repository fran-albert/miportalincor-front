import axiosInstance from "@/services/axiosConfig";
import { State } from "@/types/State/State";

export const getStates = async (): Promise<State[]> => {
    // await sleep(2);
    const { data } = await axiosInstance.get<State[]>(`state`);
    return data
}
