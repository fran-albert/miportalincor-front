import { sleep } from "@/common/helpers/helpers";
import axiosInstance from "@/services/axiosConfig";
import { Study } from "@/types/Study/Study";

interface UploadStudyProps {
    idUser: number;
    formData: FormData;
}
export const uploadStudy = async (values: UploadStudyProps) => {
    await sleep(2);
    const { data } = await axiosInstance.post<Study>(
        `/Study/upload-study`,
        values.formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    )
    return data;
}
