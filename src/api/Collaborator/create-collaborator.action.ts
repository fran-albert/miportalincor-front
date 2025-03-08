import { apiLaboral } from "@/services/axiosConfig";
import { Collaborator } from "@/types/Collaborator/Collaborator";

export const createCollaborator = async (formData: FormData) => {
    const { data } = await apiLaboral.post<Collaborator>("collaborator", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};
