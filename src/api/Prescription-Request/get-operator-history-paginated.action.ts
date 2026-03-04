import { sleep } from "@/common/helpers/helpers";
import { apiIncorHC } from "@/services/axiosConfig";
import {
  PaginatedPrescriptionRequests,
  SearchPrescriptionRequestParams,
} from "@/types/Prescription-Request/Prescription-Request";

export const getOperatorHistoryPaginated = async (
  params: SearchPrescriptionRequestParams
): Promise<PaginatedPrescriptionRequests> => {
  await sleep(1);
  const { data } = await apiIncorHC.get<PaginatedPrescriptionRequests>(
    `prescription-requests/operator/history/search`,
    { params }
  );
  return data;
};
