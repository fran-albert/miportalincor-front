import { apiLaboral } from "@/services/axiosConfig";
import { StudiesWithURL } from "@/types/Study/Study";

export const uploadStudy = async (values: FormData) => {
    const { data } = await apiLaboral.post<StudiesWithURL[]>(
        `/studies/upload-with-processing`,
        values, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    )
    return data;
}
