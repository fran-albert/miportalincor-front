import { apiIncorHC } from "@/services/axiosConfig";

export interface UploadSelloProps {
  idUser: number;
  formData: FormData;
}
export const uploadSello = async (values: UploadSelloProps) => {
  const { data } = await apiIncorHC.put(
    `/doctor/${values.idUser}/sello`,
    values.formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
