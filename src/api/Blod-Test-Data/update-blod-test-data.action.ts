import { apiIncor } from "@/services/axiosConfig";
import { BloodTestDataUpdateRequestItem } from "@/types/Blod-Test-Data/Blod-Test-Data";

export const updateBlodTestData = async (
    idStudy: number,
    bloodTestData: BloodTestDataUpdateRequestItem[]
) => {
    const { data } = await apiIncor.put(
        `BloodTestData/${idStudy}`,
        bloodTestData
    );
    return data;
};
