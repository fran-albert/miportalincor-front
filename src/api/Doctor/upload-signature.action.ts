import { apiIncorHC } from "@/services/axiosConfig";

export interface UploadSignatureProps {
  idUser: number;
  formData: FormData;
}
export const uploadSignature = async (values: UploadSignatureProps) => {
  const { data } = await apiIncorHC.put<string>(
    `/doctor/${values.idUser}/firma`,
    values.formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
