import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";

export const deleteCurrentMedication = async (id: string): Promise<void> => {
    await sleep(1);
    await apiIncorHC.delete(`current-medications/${id}`);
}