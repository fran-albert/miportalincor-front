import { apiLaboral } from "@/services/axiosConfig";
import { slugify } from "@/common/helpers/helpers";
import { Collaborator } from "@/types/Collaborator/Collaborator";

export const getCollaboratorById = async (id: number) => {
    const { data } = await apiLaboral.get<Collaborator>(`collaborator/${id}`);
    const slug = slugify(`${data.firstName} ${data.lastName}`, data.id)
    const collaborator = {
        ...data,
        slug: slug,
    }
    return collaborator;
}
