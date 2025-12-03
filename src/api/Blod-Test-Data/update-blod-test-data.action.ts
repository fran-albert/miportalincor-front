import { apiIncorHC } from "@/services/axiosConfig";
import { BloodTestDataUpdateRequestItem } from "@/types/Blod-Test-Data/Blod-Test-Data";

export const updateBlodTestData = async (
    idStudy: string,
    bloodTestData: BloodTestDataUpdateRequestItem[]
) => {
    const { data } = await apiIncorHC.put(
        `blood-test-data/${idStudy}`,
        { items: bloodTestData }
    );
    return data;
};
