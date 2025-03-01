import { apiLaboral } from "@/services/axiosConfig";

interface Props {
    collaboratorId: number;
    formData: FormData;
}
export const uploadStudyCollaborator = async (values: Props): Promise<{ url: string }> => {
    const { data } = await apiLaboral.post<{ url: string }>(
        `file/upload-study`,
        values.formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    )
    return data;
}
