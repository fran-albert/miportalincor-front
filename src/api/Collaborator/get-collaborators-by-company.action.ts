import { slugify } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";
import { Collaborator } from "@/types/Collaborator/Collaborator";

export const getCollaboratorsByCompany = async (companyId: number): Promise<Collaborator[]> => {
    const { data } = await apiLaboral.get<Collaborator[]>(`company/${companyId}/collaborators`);
    const collaboratorWithSlugs = data.map(collab => ({
        ...collab,
        slug: slugify(`${collab.firstName} ${collab.lastName}`, collab.id)
    }));

    return collaboratorWithSlugs;
}
