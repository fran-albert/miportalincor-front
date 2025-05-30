import { apiIncor } from "@/services/axiosConfig";
import { sleep } from "@/common/helpers/helpers";
import { UltraSoundImages } from "@/types/Ultra-Sound/Ultra-Sound";

export const getUltraSoundImages = async (idStudy: number) => {
    await sleep(2);
    const { data } = await apiIncor.get<UltraSoundImages[]>(`Study/ultrasoundImages/byStudy/${idStudy}`);
    return data;
}
