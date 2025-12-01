import { apiIncorHC } from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";
import { UltraSoundImages } from "@/types/Ultra-Sound/Ultra-Sound";

export const getUltraSoundImages = async (idStudy: string) => {
    await sleep(2);
    const { data } = await apiIncorHC.get<UltraSoundImages[]>(`study/ultrasoundImages/byStudy/${idStudy}`);
    return data;
}
