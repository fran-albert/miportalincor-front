import { apiIncorHC } from "@/services/axiosConfig";
import { StudiesWithURL } from "@/types/Study/Study";

export const uploadExternalStudy = async (values: FormData): Promise<StudiesWithURL> => {
    const { data } = await apiIncorHC.post<StudiesWithURL>(
        `/study/upload-external-study`,
        values,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return data;
};
