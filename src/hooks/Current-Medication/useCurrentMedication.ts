import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCurrentMedication } from "@/api/Current-Medication/create-current-medication.action";
import { getCurrentMedicationsByUser } from "@/api/Current-Medication/get-current-medications-by-user.action";
import { getCurrentMedicationById } from "@/api/Current-Medication/get-current-medication-by-id.action";
import { updateCurrentMedication } from "@/api/Current-Medication/update-current-medication.action";
import { suspendCurrentMedication } from "@/api/Current-Medication/suspend-current-medication.action";
import { reactivateCurrentMedication } from "@/api/Current-Medication/reactivate-current-medication.action";
import { deleteCurrentMedication } from "@/api/Current-Medication/delete-current-medication.action";
import {
  CurrentMedication,
  CurrentMedicationResponse,
  CreateCurrentMedicationDto,
  UpdateCurrentMedicationDto,
  SuspendCurrentMedicationDto,
  ReactivateCurrentMedicationDto,
  CurrentMedicationFilters,
} from "@/types/Current-Medication/Current-Medication";
import {
  isCurrentMedicationListForHistoriaQueryKey,
  isCurrentMedicationListQueryKey,
  isHistoriaCurrentMedicationQueryKey,
  reconcileCurrentMedicationQueryData,
  removeCurrentMedicationQueryData,
} from "./currentMedicationCache";

type CurrentMedicationQueryClient = ReturnType<typeof useQueryClient>;

export const currentMedicationKeys = {
  all: ["currentMedications"] as const,
  lists: () => [...currentMedicationKeys.all, "list"] as const,
  list: (idUserHistoriaClinica: string, filters?: CurrentMedicationFilters) =>
    [...currentMedicationKeys.lists(), idUserHistoriaClinica, filters] as const,
  details: () => [...currentMedicationKeys.all, "detail"] as const,
  detail: (id: string) => [...currentMedicationKeys.details(), id] as const,
};

const invalidateCurrentMedicationQueries = (
  queryClient: CurrentMedicationQueryClient
) =>
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: currentMedicationKeys.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: ["historia-clinica"],
      type: "all",
    }),
  ]);

const reconcileMedicationInCachedQueries = (
  queryClient: CurrentMedicationQueryClient,
  medication: CurrentMedication,
  mode: "replace" | "upsert",
  historiaUserId?: string | number
) => {
  queryClient.setQueryData(
    currentMedicationKeys.detail(String(medication.id)),
    medication
  );

  queryClient
    .getQueryCache()
    .findAll({
      predicate: (query) =>
        isHistoriaCurrentMedicationQueryKey(query.queryKey, historiaUserId),
    })
    .forEach((query) => {
      queryClient.setQueryData(query.queryKey, (data: unknown) =>
        reconcileCurrentMedicationQueryData(
          data,
          medication,
          query.queryKey,
          mode
        )
      );
    });

  queryClient
    .getQueryCache()
    .findAll({
      predicate: (query) =>
        isCurrentMedicationListForHistoriaQueryKey(
          query.queryKey,
          mode === "upsert" ? medication.idUserHistoriaClinica : undefined
        ),
    })
    .forEach((query) => {
      queryClient.setQueryData(query.queryKey, (data: unknown) =>
        reconcileCurrentMedicationQueryData(
          data,
          medication,
          query.queryKey,
          mode
        )
      );
    });
};

const removeMedicationFromCachedQueries = (
  queryClient: CurrentMedicationQueryClient,
  medicationId: string
) => {
  queryClient.removeQueries({
    queryKey: currentMedicationKeys.detail(medicationId),
  });

  queryClient
    .getQueryCache()
    .findAll({
      predicate: (query) =>
        isHistoriaCurrentMedicationQueryKey(query.queryKey) ||
        isCurrentMedicationListQueryKey(query.queryKey),
    })
    .forEach((query) => {
      queryClient.setQueryData(query.queryKey, (data: unknown) =>
        removeCurrentMedicationQueryData(data, medicationId)
      );
    });
};

export const useCurrentMedications = (
  idUserHistoriaClinica: string,
  filters?: CurrentMedicationFilters,
  enabled: boolean = true
) => {
  return useQuery<CurrentMedicationResponse>({
    queryKey: currentMedicationKeys.list(idUserHistoriaClinica, filters),
    queryFn: () =>
      getCurrentMedicationsByUser(idUserHistoriaClinica, filters),
    enabled: enabled && !!idUserHistoriaClinica,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCurrentMedication = (id: string, enabled: boolean = true) => {
  return useQuery<CurrentMedication>({
    queryKey: currentMedicationKeys.detail(id),
    queryFn: () => getCurrentMedicationById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<CurrentMedication, Error, CreateCurrentMedicationDto>({
    mutationFn: createCurrentMedication,
    onSuccess: (data, variables) => {
      reconcileMedicationInCachedQueries(
        queryClient,
        data,
        "upsert",
        variables.idUser
      );

      return invalidateCurrentMedicationQueries(queryClient);
    },
    onError: (error) => {
      console.error("Error creating current medication:", error);
    },
  });
};

export const useUpdateCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CurrentMedication,
    Error,
    { id: string; data: UpdateCurrentMedicationDto }
  >({
    mutationFn: ({ id, data }) => updateCurrentMedication(id, data),
    onSuccess: (data) => {
      reconcileMedicationInCachedQueries(queryClient, data, "replace");

      return invalidateCurrentMedicationQueries(queryClient);
    },
    onError: (error) => {
      console.error("Error updating current medication:", error);
    },
  });
};

export const useSuspendCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CurrentMedication,
    Error,
    { id: string; data: SuspendCurrentMedicationDto }
  >({
    mutationFn: ({ id, data }) => suspendCurrentMedication(id, data),
    onSuccess: (data) => {
      reconcileMedicationInCachedQueries(queryClient, data, "replace");

      return invalidateCurrentMedicationQueries(queryClient);
    },
    onError: (error) => {
      console.error("Error suspending current medication:", error);
    },
  });
};

export const useReactivateCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CurrentMedication,
    Error,
    { id: string; data: ReactivateCurrentMedicationDto }
  >({
    mutationFn: ({ id, data }) => reactivateCurrentMedication(id, data),
    onSuccess: (data) => {
      reconcileMedicationInCachedQueries(queryClient, data, "replace");

      return invalidateCurrentMedicationQueries(queryClient);
    },
    onError: (error) => {
      console.error("Error reactivating current medication:", error);
    },
  });
};

export const useDeleteCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteCurrentMedication,
    onSuccess: (_, id) => {
      removeMedicationFromCachedQueries(queryClient, id);

      return invalidateCurrentMedicationQueries(queryClient);
    },
    onError: (error) => {
      console.error("Error deleting current medication:", error);
    },
  });
};
