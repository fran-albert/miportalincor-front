import type { QueryKey } from "@tanstack/react-query";
import {
  CurrentMedication,
  CurrentMedicationResponse,
  MedicationStatus,
} from "@/types/Current-Medication/Current-Medication";

type CacheMode = "replace" | "upsert";
type MedicationStatusFilter = MedicationStatus | "ALL";

const HISTORIA_CLINICA_KEY = "historia-clinica";
const MEDICACION_ACTUAL_KEY = "medicacion-actual";
const CURRENT_MEDICATIONS_KEY = "currentMedications";
const CURRENT_MEDICATIONS_LIST_KEY = "list";

const getQueryUserId = (queryKey: QueryKey): string | undefined => {
  const userId = queryKey[1];
  if (typeof userId === "string" || typeof userId === "number") {
    return String(userId);
  }
  return undefined;
};

const getStatusFilter = (queryKey: QueryKey): MedicationStatusFilter | undefined => {
  const maybeParams = queryKey[3];
  if (!maybeParams || typeof maybeParams !== "object" || !("status" in maybeParams)) {
    return undefined;
  }

  const status = (maybeParams as { status?: unknown }).status;
  if (
    status === MedicationStatus.ACTIVE ||
    status === MedicationStatus.SUSPENDED ||
    status === "ALL"
  ) {
    return status;
  }

  return undefined;
};

const matchesStatusFilter = (
  medication: CurrentMedication,
  queryKey: QueryKey
) => {
  const statusFilter = getStatusFilter(queryKey);
  return (
    !statusFilter ||
    statusFilter === "ALL" ||
    medication.status === statusFilter
  );
};

const mergeMedication = (
  cachedMedication: CurrentMedication,
  medication: CurrentMedication
): CurrentMedication => ({
  ...cachedMedication,
  ...medication,
  doctor: medication.doctor ?? cachedMedication.doctor,
  lastEditedByDoctor:
    medication.lastEditedByDoctor ?? cachedMedication.lastEditedByDoctor,
  suspendedByDoctor:
    medication.suspendedByDoctor ?? cachedMedication.suspendedByDoctor,
  deletedByDoctor: medication.deletedByDoctor ?? cachedMedication.deletedByDoctor,
});

export const isHistoriaCurrentMedicationQueryKey = (
  queryKey: QueryKey,
  userId?: string | number
) => {
  const matchesBase =
    queryKey[0] === HISTORIA_CLINICA_KEY &&
    queryKey[2] === MEDICACION_ACTUAL_KEY;

  if (!matchesBase || userId === undefined) {
    return matchesBase;
  }

  return getQueryUserId(queryKey) === String(userId);
};

export const isCurrentMedicationListQueryKey = (queryKey: QueryKey) =>
  queryKey[0] === CURRENT_MEDICATIONS_KEY &&
  queryKey[1] === CURRENT_MEDICATIONS_LIST_KEY;

export const isCurrentMedicationListForHistoriaQueryKey = (
  queryKey: QueryKey,
  idUserHistoriaClinica?: string
) => {
  const matchesList = isCurrentMedicationListQueryKey(queryKey);
  if (!matchesList || idUserHistoriaClinica === undefined) {
    return matchesList;
  }

  return String(queryKey[2]) === idUserHistoriaClinica;
};

export const reconcileCurrentMedicationList = (
  medications: CurrentMedication[],
  medication: CurrentMedication,
  queryKey: QueryKey,
  mode: CacheMode
): CurrentMedication[] => {
  const medicationId = String(medication.id);
  const shouldKeep = matchesStatusFilter(medication, queryKey);
  let found = false;

  const reconciled = medications.reduce<CurrentMedication[]>((acc, item) => {
    if (String(item.id) !== medicationId) {
      acc.push(item);
      return acc;
    }

    found = true;
    if (shouldKeep) {
      acc.push(mergeMedication(item, medication));
    }
    return acc;
  }, []);

  if (!found && mode === "upsert" && shouldKeep) {
    return [medication, ...medications];
  }

  return found ? reconciled : medications;
};

export const removeCurrentMedicationFromList = (
  medications: CurrentMedication[],
  medicationId: string
) => medications.filter((item) => String(item.id) !== String(medicationId));

export const reconcileCurrentMedicationQueryData = (
  data: unknown,
  medication: CurrentMedication,
  queryKey: QueryKey,
  mode: CacheMode
) => {
  if (Array.isArray(data)) {
    return reconcileCurrentMedicationList(data, medication, queryKey, mode);
  }

  const response = data as CurrentMedicationResponse | undefined;
  if (response && Array.isArray(response.currentMedications)) {
    const currentMedications = reconcileCurrentMedicationList(
      response.currentMedications,
      medication,
      queryKey,
      mode
    );

    return {
      ...response,
      currentMedications,
      total: currentMedications.length,
    };
  }

  return data;
};

export const removeCurrentMedicationQueryData = (
  data: unknown,
  medicationId: string
) => {
  if (Array.isArray(data)) {
    return removeCurrentMedicationFromList(data, medicationId);
  }

  const response = data as CurrentMedicationResponse | undefined;
  if (response && Array.isArray(response.currentMedications)) {
    const currentMedications = removeCurrentMedicationFromList(
      response.currentMedications,
      medicationId
    );

    return {
      ...response,
      currentMedications,
      total: currentMedications.length,
    };
  }

  return data;
};
