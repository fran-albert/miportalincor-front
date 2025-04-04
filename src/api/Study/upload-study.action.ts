import { sleep } from "@/common/helpers/helpers";
import { apiLaboral } from "@/services/axiosConfig";
import { Study } from "@/types/Study/Study";

interface UploadStudyProps {
    idUser: number;
    formData: FormData;
}
export const uploadStudy = async (values: UploadStudyProps) => {
    await sleep(2);
    const { data } = await apiLaboral.post<Study>(
        `/studies/upload-with-processing`,
        values.formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    )
    return data;
}
