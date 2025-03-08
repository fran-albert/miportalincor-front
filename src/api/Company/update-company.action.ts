import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

export const updateBlodTest = async (id: number, newBlodTest: BloodTest) => {
    await sleep(2);
    const { data } = await apiIncor.put<BloodTest>(`BloodTest/${id}`, newBlodTest);
    return data;
}
