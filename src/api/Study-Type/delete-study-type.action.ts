import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";

export const deleteStudyType = async (id: number) => {
    await sleep(2);
    await apiIncorHC.delete(`study-type/${id}`);
}
