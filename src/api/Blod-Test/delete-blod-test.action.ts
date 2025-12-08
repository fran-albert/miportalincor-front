import { apiIncorHC } from "@/services/axiosConfig";

export const deleteBlodTest = async (id: number) => {
    const { data } = await apiIncorHC.delete(`blood-test/${id}`);
    return data;
}
