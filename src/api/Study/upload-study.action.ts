import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";

interface StudyResponse {
    id: number;
    locationS3: string;
    studyTypeId: number;
    studyType: null | string;
    date: string;
    note: string;
    created: string;
    signedUrl: string;
    ultrasoundImages: null | any[];
}

export const uploadStudy = async (values: FormData) => {
    await sleep(2);
    const { data } = await apiIncor.post<StudyResponse>(
        `/Study/upload-study`,
        values, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    )
    return data;
}
