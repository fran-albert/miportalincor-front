import { apiIncorHC } from "@/services/axiosConfig";
import {
  PaginatedStudyInboxResponse,
  StudyInboxStatus,
} from "@/types/StudyInbox/StudyInbox.types";

export interface GetStudyInboxParams {
  status?: StudyInboxStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export const getStudyInbox = async (
  params: GetStudyInboxParams = {}
): Promise<PaginatedStudyInboxResponse> => {
  const { status, search = "", page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);
  if (search) queryParams.append("search", search);
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  const { data } = await apiIncorHC.get<PaginatedStudyInboxResponse>(
    `/study-inbox?${queryParams.toString()}`
  );

  return data;
};
