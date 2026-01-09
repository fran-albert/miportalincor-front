import { apiIncorHC } from "@/services/axiosConfig";

export interface UploadAttachmentResponse {
  url: string;
}

export const uploadPrescriptionAttachment = async (
  file: File
): Promise<UploadAttachmentResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiIncorHC.post<UploadAttachmentResponse>(
    `prescription-requests/upload-attachment`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
