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

// Query Keys
export const currentMedicationKeys = {
  all: ["currentMedications"] as const,
  lists: () => [...currentMedicationKeys.all, "list"] as const,
  list: (idUserHistoriaClinica: string, filters?: CurrentMedicationFilters) =>
    [...currentMedicationKeys.lists(), idUserHistoriaClinica, filters] as const,
  details: () => [...currentMedicationKeys.all, "detail"] as const,
  detail: (id: string) => [...currentMedicationKeys.details(), id] as const,
};

// Get Current Medications List
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Current Medication by ID
export const useCurrentMedication = (id: string, enabled: boolean = true) => {
  return useQuery<CurrentMedication>({
    queryKey: currentMedicationKeys.detail(id),
    queryFn: () => getCurrentMedicationById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create Current Medication
export const useCreateCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<CurrentMedication, Error, CreateCurrentMedicationDto>({
    mutationFn: createCurrentMedication,
    onSuccess: () => {
      // Invalidate and refetch current medications list
      queryClient.invalidateQueries({
        queryKey: currentMedicationKeys.lists(),
      });

      // Invalidate all historia-clinica queries to refresh medication lists
      queryClient.invalidateQueries({
        queryKey: ['historia-clinica'],
        type: 'all'
      });
    },
    onError: (error) => {
      console.error("Error creating current medication:", error);
    },
  });
};

// Update Current Medication
export const useUpdateCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CurrentMedication,
    Error,
    { id: string; data: UpdateCurrentMedicationDto }
  >({
    mutationFn: ({ id, data }) =>
      updateCurrentMedication(id, data),
    onSuccess: (data) => {
      // Update the specific medication in cache
      queryClient.setQueryData(
        currentMedicationKeys.detail(String(data.id)),
        data
      );

      // Invalidate and refetch lists
      queryClient.invalidateQueries({
        queryKey: currentMedicationKeys.lists(),
      });

      // Invalidate all historia-clinica queries to refresh medication lists
      queryClient.invalidateQueries({
        queryKey: ['historia-clinica'],
        type: 'all'
      });

    },
    onError: (error) => {
      console.error("Error updating current medication:", error);
    },
  });
};

// Suspend Current Medication
export const useSuspendCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CurrentMedication,
    Error,
    { id: string; data: SuspendCurrentMedicationDto }
  >({
    mutationFn: ({ id, data }) =>
      suspendCurrentMedication(id, data),
    onSuccess: (data) => {
      // Update the specific medication in cache
      queryClient.setQueryData(
        currentMedicationKeys.detail(String(data.id)),
        data
      );

      // Invalidate and refetch lists
      queryClient.invalidateQueries({
        queryKey: currentMedicationKeys.lists(),
      });

      // Invalidate all historia-clinica queries to refresh medication lists
      queryClient.invalidateQueries({
        queryKey: ['historia-clinica'],
        type: 'all'
      });

    },
    onError: (error) => {
      console.error("Error suspending current medication:", error);
    },
  });
};

// Reactivate Current Medication
export const useReactivateCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CurrentMedication,
    Error,
    { id: string; data: ReactivateCurrentMedicationDto }
  >({
    mutationFn: ({ id, data }) =>
      reactivateCurrentMedication(id, data),
    onSuccess: (data) => {
      // Update the specific medication in cache
      queryClient.setQueryData(
        currentMedicationKeys.detail(String(data.id)),
        data
      );

      // Invalidate and refetch lists
      queryClient.invalidateQueries({
        queryKey: currentMedicationKeys.lists(),
      });

      // Invalidate all historia-clinica queries to refresh medication lists
      queryClient.invalidateQueries({
        queryKey: ['historia-clinica'],
        type: 'all'
      });

    },
    onError: (error) => {
      console.error("Error reactivating current medication:", error);
    },
  });
};

// Delete Current Medication
export const useDeleteCurrentMedication = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteCurrentMedication,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: currentMedicationKeys.detail(id),
      });

      // Invalidate and refetch lists
      queryClient.invalidateQueries({
        queryKey: currentMedicationKeys.lists(),
      });

      // Invalidate all historia-clinica queries to refresh medication lists
      queryClient.invalidateQueries({
        queryKey: ['historia-clinica'],
        type: 'all'
      });

    },
    onError: (error) => {
      console.error("Error deleting current medication:", error);
    },
  });
};