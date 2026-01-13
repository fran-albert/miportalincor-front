import { apiIncorHC } from "@/services/axiosConfig";

export interface UploadDoctorPrescriptionResponse {
  url: string;
}

export const uploadDoctorPrescription = async (
  requestId: string,
  file: File
): Promise<UploadDoctorPrescriptionResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiIncorHC.post<UploadDoctorPrescriptionResponse>(
    `prescription-requests/${requestId}/upload-prescription`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
