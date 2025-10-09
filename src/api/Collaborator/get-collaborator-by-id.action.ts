import { apiLaboral } from "@/services/axiosConfig";
import { slugify } from "@/common/helpers/helpers";

export const getCollaboratorById = async (id: number) => {
    const { data } = await apiLaboral.get<any>(`collaborator/${id}`);
    const slug = slugify(`${data.firstName} ${data.lastName}`, data.id)
    const collaborator = {
        ...data,
        slug: slug,
    }
    return collaborator;
}
