import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";

interface Props {
    userId: number;
    formData: FormData;
}
export const uploadExcelNutritionData = async (values: Props) => {
    await sleep(2);
    const { data } = await apiIncor.post<string>(
        `/NutritionData/upload-excel?userId=${values.userId}`,
        values.formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    )
    return data;
}
