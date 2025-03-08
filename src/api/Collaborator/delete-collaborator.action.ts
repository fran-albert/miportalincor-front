import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";

export const deleteCollaborator = async (id: number): Promise<void> => {
    await sleep(2);
    const { data } = await apiLaboral.delete<void>(`collaborator/${id}`);
    return data;
}
