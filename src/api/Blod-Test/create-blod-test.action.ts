import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";

export const createBlodTest = async (newBlodTest: BloodTest) => {
    await sleep(2);
    const { data } = await apiIncor.post<BloodTest>(`BloodTest`, newBlodTest);
    return data;
}
