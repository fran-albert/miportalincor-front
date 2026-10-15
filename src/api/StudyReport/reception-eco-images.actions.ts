import { apiIncorHC } from "@/services/axiosConfig";
import {
  ReceptionEcoItem,
  ReceptionUploadedImage,
  UploadReceptionEcoImagesResult,
} from "@/types/StudyReport/ReceptionEcoImages.types";

const BASE = "/study-reports/reception/eco-items";

export interface GetReceptionEcoItemsParams {
  onlyWithoutImages: boolean;
  search?: string;
}

export const getReceptionEcoItems = async ({
  onlyWithoutImages,
  search,
}: GetReceptionEcoItemsParams): Promise<ReceptionEcoItem[]> => {
  const params = new URLSearchParams();
  params.append("onlyWithoutImages", String(onlyWithoutImages));
  if (search?.trim()) params.append("q", search.trim());
  const { data } = await apiIncorHC.get<ReceptionEcoItem[]>(
    `${BASE}?${params.toString()}`,
  );
  return data;
};

export const getReceptionEcoItemImages = async (
  itemId: string,
): Promise<ReceptionUploadedImage[]> => {
  const { data } = await apiIncorHC.get<ReceptionUploadedImage[]>(
    `${BASE}/${itemId}/images`,
  );
  return data;
};

export const getReceptionEcoImage = async (
  itemId: string,
  imageId: string,
): Promise<Blob> => {
  const { data } = await apiIncorHC.get<Blob>(
    `${BASE}/${itemId}/images/${imageId}`,
    { responseType: "blob" },
  );
  return data;
};

export const uploadReceptionEcoImages = async (
  itemId: string,
  files: File[],
  reportIds: string[],
): Promise<UploadReceptionEcoImagesResult> => {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  for (const reportId of reportIds) formData.append("reportIds", reportId);
  const { data } = await apiIncorHC.post<UploadReceptionEcoImagesResult>(
    `${BASE}/${itemId}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

export const deleteReceptionEcoImage = async (
  itemId: string,
  imageId: string,
): Promise<void> => {
  await apiIncorHC.delete(`${BASE}/${itemId}/images/${imageId}`);
};
