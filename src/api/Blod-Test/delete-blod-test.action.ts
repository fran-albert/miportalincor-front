import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

export const deleteBlodTest = async (id: number) => {
    await sleep(2);
    const { data } = await apiIncor.delete<BloodTest>(`BloodTest/${id}`);
    return data;
}
