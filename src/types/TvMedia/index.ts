export type MediaType = 'VIDEO' | 'IMAGE';

export interface TvMedia {
  id: number;
  title: string;
  description?: string;
  mediaType: MediaType;
  s3Key: string;
  s3Url: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  mimeType?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTvMediaDto {
  title: string;
  description?: string;
  mediaType?: MediaType;
}

export interface UpdateTvMediaDto {
  title?: string;
  description?: string;
  isActive?: boolean;
  orderIndex?: number;
}

export interface ReorderMediaDto {
  orderedIds: number[];
}

export interface MultipartTvMediaUploadInitResponse {
  uploadId: string;
  s3Key: string;
  partSizeBytes: number;
}

export interface SignMultipartTvMediaPartDto {
  uploadId: string;
  s3Key: string;
  partNumber: number;
}

export interface SignMultipartTvMediaPartResponse {
  uploadUrl: string;
}

export interface CompletedMultipartTvMediaPartDto {
  partNumber: number;
  eTag: string;
}

export interface CompleteMultipartTvMediaUploadDto extends CreateTvMediaDto {
  uploadId: string;
  s3Key: string;
  mimeType: string;
  fileSizeBytes: number;
  parts: CompletedMultipartTvMediaPartDto[];
}

export interface AbortMultipartTvMediaUploadDto {
  uploadId: string;
  s3Key: string;
}

export interface UploadMediaMultipartOptions {
  file: File;
  title: string;
  description?: string;
  mediaType?: MediaType;
  onProgress?: (progress: number) => void;
  onStatusChange?: (message: string) => void;
}
