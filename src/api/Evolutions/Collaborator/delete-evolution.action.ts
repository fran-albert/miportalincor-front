import { apiLaboral } from "@/services/axiosConfig";

export const deleteEvolution = async (id: number) => {
    const { data } = await apiLaboral.delete<void>(`medical-evaluation/evolution/${id}`);
    return data;
}