import { sleep } from "@/common/helpers/helpers";
import { Secretary, UpdateSecretaryDto } from "@/types/Secretary/Secretary";
import { apiIncorHC } from "@/services/axiosConfig";

export const updateSecretary = async (id: string, secretary: UpdateSecretaryDto) => {
    await sleep(2);
    const { data } = await apiIncorHC.put<Secretary>(`/secretaries/${id}`, secretary);
    return data;
}
