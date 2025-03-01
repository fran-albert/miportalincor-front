import { apiIncor } from "@/services/axiosConfig";
import { State } from "@/types/State/State";

export const getStates = async (): Promise<State[]> => {
    // await sleep(2);
    const { data } = await apiIncor.get<State[]>(`state`);
    return data
}
