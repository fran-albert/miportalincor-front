import { parseGreenCardDescription } from "@/components/Prescription-Request/utils/greenCardDescription";
import {
  PrescriptionRequest,
  PrescriptionRequestStatus,
} from "@/types/Prescription-Request/Prescription-Request";

export interface PrescriptionHistoryBatchMedication {
  key: string;
  name: string;
  dosage?: string;
  quantity?: string;
}

export interface PrescriptionHistoryBatchEntry {
  type: "batch";
  key: string;
  batchId: string;
  request: PrescriptionRequest;
  requests: PrescriptionRequest[];
  medications: PrescriptionHistoryBatchMedication[];
  prescriptionUrls: string[];
  prescriptionLinks: string[];
}

export interface PrescriptionHistoryIndividualEntry {
  type: "individual";
  key: string;
  request: PrescriptionRequest;
}

export type PrescriptionHistoryEntry =
  | PrescriptionHistoryBatchEntry
  | PrescriptionHistoryIndividualEntry;

const statusOrder = {
  [PrescriptionRequestStatus.PENDING]: 0,
  [PrescriptionRequestStatus.IN_PROGRESS]: 1,
  [PrescriptionRequestStatus.COMPLETED]: 2,
  [PrescriptionRequestStatus.REJECTED]: 3,
  [PrescriptionRequestStatus.CANCELLED]: 4,
};

const uniqueStrings = (values: Array<string | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

export function sortPrescriptionRequests(requests: PrescriptionRequest[]) {
  return [...requests].sort((left, right) => {
    const statusDiff = statusOrder[left.status] - statusOrder[right.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }

    return (
      new Date(right.createdAt || 0).getTime() -
      new Date(left.createdAt || 0).getTime()
    );
  });
}

function buildBatchEntry(
  batchId: string,
  requests: PrescriptionRequest[],
): PrescriptionHistoryBatchEntry {
  const sortedBatchRequests = sortPrescriptionRequests(requests);
  const request = sortedBatchRequests[0];

  return {
    type: "batch",
    key: `batch-${batchId}`,
    batchId,
    request,
    requests: sortedBatchRequests,
    medications: sortedBatchRequests.map((batchRequest) => {
      const parsed = parseGreenCardDescription(batchRequest.description);

      return {
        key:
          batchRequest.greenCardItemId ||
          String(batchRequest.id) ||
          batchRequest.description,
        name: parsed.name || batchRequest.description,
        dosage: parsed.dosage || undefined,
        quantity: parsed.quantity || undefined,
      };
    }),
    prescriptionUrls: uniqueStrings(
      sortedBatchRequests.flatMap((batchRequest) => batchRequest.prescriptionUrls),
    ),
    prescriptionLinks: uniqueStrings(
      sortedBatchRequests.map((batchRequest) => batchRequest.prescriptionLink),
    ),
  };
}

export function buildPrescriptionHistoryEntries(
  requests: PrescriptionRequest[],
): PrescriptionHistoryEntry[] {
  const sortedRequests = sortPrescriptionRequests(requests);
  const batchRequests = new Map<string, PrescriptionRequest[]>();

  for (const request of sortedRequests) {
    if (!request.batchId) {
      continue;
    }

    const existingBatch = batchRequests.get(request.batchId) || [];
    existingBatch.push(request);
    batchRequests.set(request.batchId, existingBatch);
  }

  const entries: PrescriptionHistoryEntry[] = [];
  const seenBatchIds = new Set<string>();

  for (const request of sortedRequests) {
    if (!request.batchId) {
      entries.push({
        type: "individual",
        key: `request-${request.id}`,
        request,
      });
      continue;
    }

    if (seenBatchIds.has(request.batchId)) {
      continue;
    }

    const requestsInBatch = batchRequests.get(request.batchId);
    if (!requestsInBatch || requestsInBatch.length === 0) {
      continue;
    }

    entries.push(buildBatchEntry(request.batchId, requestsInBatch));
    seenBatchIds.add(request.batchId);
  }

  return entries;
}
