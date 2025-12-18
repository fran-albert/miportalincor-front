import { slugify } from "@/common/helpers/helpers";
import { Secretary } from "@/types/Secretary/Secretary";
import { apiIncorHC } from "@/services/axiosConfig";

export const getSecretaries = async (): Promise<Secretary[]> => {
    const { data } = await apiIncorHC.get<Secretary[]>(`/secretaries`);
    const secretariesWithSlugs = data.map(secretary => ({
        ...secretary,
        slug: slugify(`${secretary.firstName} ${secretary.lastName}`, secretary.id)
    }));

    return secretariesWithSlugs;
}
