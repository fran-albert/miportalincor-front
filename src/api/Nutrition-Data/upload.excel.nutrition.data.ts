import { apiIncorHC } from "@/services/axiosConfig";

interface Props {
    userId: string;
    formData: FormData;
}

interface UploadResponse {
    message: string;
    count: number;
}

export const uploadExcelNutritionData = async (values: Props) => {
    values.formData.append('userId', values.userId);
    const { data } = await apiIncorHC.post<UploadResponse>(
        `/nutrition-data/upload-excel`,
        values.formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    )
    return data;
}
