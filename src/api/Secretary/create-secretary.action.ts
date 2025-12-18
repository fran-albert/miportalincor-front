import { sleep } from "@/common/helpers/helpers";
import { Secretary, CreateSecretaryDto } from "@/types/Secretary/Secretary";
import { apiIncorHC } from "@/services/axiosConfig";

export const createSecretary = async (secretary: CreateSecretaryDto) => {
    await sleep(2);
    const { data } = await apiIncorHC.post<Secretary>(`/secretaries`, secretary);
    return data;
}
