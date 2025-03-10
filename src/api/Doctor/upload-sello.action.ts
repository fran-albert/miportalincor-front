import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";

export interface UploadSelloProps {
  idUser: number;
  formData: FormData;
}
export const uploadSello = async (values: UploadSelloProps) => {
  await sleep(2);
  const { data } = await apiIncor.put(
    `/Doctor/${values.idUser}/sello`,
    values.formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
