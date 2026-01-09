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
