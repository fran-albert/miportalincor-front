import { apiLaboral } from "@/services/axiosConfig";
import { Collaborator } from "@/types/Collaborator/Collaborator";

export const updateCollaborator = async (id: number, formData: FormData) => {
    const { data } = await apiLaboral.patch<Collaborator>(`collaborator/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return data;
};
