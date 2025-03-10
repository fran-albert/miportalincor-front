import { sleep } from "@/common/helpers/helpers";
import { apiIncor } from "@/services/axiosConfig";

export interface UploadSignatureProps {
  idUser: number;
  formData: FormData;
}
export const uploadSignature = async (values: UploadSignatureProps) => {
  await sleep(2);
  const { data } = await apiIncor.put<string>(
    `/Doctor/${values.idUser}/firma`,
    values.formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
