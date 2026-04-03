import { apiTurnos } from "@/services/axiosConfig";
import type {
  AbortMultipartTvMediaUploadDto,
  CompleteMultipartTvMediaUploadDto,
  MultipartTvMediaUploadInitResponse,
  ReorderMediaDto,
  SignMultipartTvMediaPartDto,
  SignMultipartTvMediaPartResponse,
  TvMedia,
  UpdateTvMediaDto,
  UploadMediaMultipartOptions,
} from "@/types/TvMedia";

const MULTIPART_PART_SIZE_BYTES = 10 * 1024 * 1024;

export async function getAllMedia(): Promise<TvMedia[]> {
  const response = await apiTurnos.get<TvMedia[]>("/tv-media/all");
  return response.data;
}

export async function getMediaById(id: number): Promise<TvMedia> {
  const response = await apiTurnos.get<TvMedia>(`/tv-media/${id}`);
  return response.data;
}

export async function uploadMedia(
  file: File,
  title: string,
  description?: string,
  mediaType: "VIDEO" | "IMAGE" = "VIDEO",
  onProgress?: (progress: number) => void,
  onStatusChange?: (message: string) => void
): Promise<TvMedia> {
  return uploadMediaMultipart({
    file,
    title,
    description,
    mediaType,
    onProgress,
    onStatusChange,
  });
}

export async function initiateMultipartUpload(
  file: File,
  title: string,
  description?: string,
  mediaType: "VIDEO" | "IMAGE" = "VIDEO"
): Promise<MultipartTvMediaUploadInitResponse> {
  const response = await apiTurnos.post<MultipartTvMediaUploadInitResponse>(
    "/tv-media/multipart/initiate",
    {
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || "application/octet-stream",
      title,
      description,
      mediaType,
    }
  );

  return response.data;
}

export async function getMultipartUploadPartUrl(
  dto: SignMultipartTvMediaPartDto
): Promise<SignMultipartTvMediaPartResponse> {
  const response = await apiTurnos.post<SignMultipartTvMediaPartResponse>(
    "/tv-media/multipart/part-url",
    dto
  );

  return response.data;
}

export async function completeMultipartUpload(
  dto: CompleteMultipartTvMediaUploadDto
): Promise<TvMedia> {
  const response = await apiTurnos.post<TvMedia>("/tv-media/multipart/complete", dto);
  return response.data;
}

export async function abortMultipartUpload(
  dto: AbortMultipartTvMediaUploadDto
): Promise<void> {
  await apiTurnos.post("/tv-media/multipart/abort", dto);
}

function uploadPartToS3(
  uploadUrl: string,
  blob: Blob,
  onProgress?: (loadedBytes: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", blob.type || "application/octet-stream");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(event.loaded);
      }
    };

    xhr.onerror = () => reject(new Error("Error de red al subir una parte a S3"));
    xhr.onabort = () => reject(new Error("La subida multipart fue abortada"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const eTag = xhr.getResponseHeader("ETag");
        if (!eTag) {
          reject(new Error("S3 no devolvió ETag para una de las partes"));
          return;
        }

        resolve(eTag);
        return;
      }

      reject(new Error(`S3 devolvió ${xhr.status} al subir una parte`));
    };

    xhr.send(blob);
  });
}

export async function uploadMediaMultipart({
  file,
  title,
  description,
  mediaType = "VIDEO",
  onProgress,
  onStatusChange,
}: UploadMediaMultipartOptions): Promise<TvMedia> {
  onStatusChange?.("Inicializando subida multipart...");

  const init = await initiateMultipartUpload(file, title, description, mediaType);
  const partSize = init.partSizeBytes || MULTIPART_PART_SIZE_BYTES;
  const totalParts = Math.max(1, Math.ceil(file.size / partSize));
  const parts: CompleteMultipartTvMediaUploadDto["parts"] = [];

  try {
    for (let partNumber = 1; partNumber <= totalParts; partNumber += 1) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);

      onStatusChange?.(`Subiendo parte ${partNumber} de ${totalParts}...`);

      const { uploadUrl } = await getMultipartUploadPartUrl({
        uploadId: init.uploadId,
        s3Key: init.s3Key,
        partNumber,
      });

      const eTag = await uploadPartToS3(uploadUrl, blob, (loadedBytes) => {
        const uploadedBeforeCurrentPart = start;
        const totalLoaded = Math.min(uploadedBeforeCurrentPart + loadedBytes, file.size);
        onProgress?.(Math.round((totalLoaded / file.size) * 100));
      });

      parts.push({
        partNumber,
        eTag,
      });
    }

    onStatusChange?.("Finalizando y registrando media...");
    onProgress?.(100);

    return completeMultipartUpload({
      title,
      description,
      mediaType,
      uploadId: init.uploadId,
      s3Key: init.s3Key,
      mimeType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
      parts,
    });
  } catch (error) {
    await abortMultipartUpload({
      uploadId: init.uploadId,
      s3Key: init.s3Key,
    }).catch(() => undefined);

    throw error;
  }
}

export async function updateMedia(
  id: number,
  dto: UpdateTvMediaDto
): Promise<TvMedia> {
  const response = await apiTurnos.patch<TvMedia>(`/tv-media/${id}`, dto);
  return response.data;
}

export async function deleteMedia(id: number): Promise<void> {
  await apiTurnos.delete(`/tv-media/${id}`);
}

export async function toggleMediaActive(id: number): Promise<TvMedia> {
  const response = await apiTurnos.patch<TvMedia>(`/tv-media/${id}/toggle`);
  return response.data;
}

export async function reorderMedia(dto: ReorderMediaDto): Promise<void> {
  await apiTurnos.patch("/tv-media/reorder", dto);
}
