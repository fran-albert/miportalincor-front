import axiosInstance from "@/services/axiosConfig";
import { BloodTestDataUpdateRequest } from "@/types/Blod-Test-Data/Blod-Test-Data";

export const updateBlodTestData = async (
    idStudy: number,
    bloodTestData: BloodTestDataUpdateRequest[]
) => {
    const { data } = await axiosInstance.put(
        `BloodTestData/${idStudy}`,
        bloodTestData
    );
    return data;
};
