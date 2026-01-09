import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPrescriptionRequest,
  getMyPrescriptionRequests,
  getDoctorPendingRequests,
  getDoctorRequestHistory,
  getPrescriptionRequestById,
  takePrescriptionRequest,
  completePrescriptionRequest,
  rejectPrescriptionRequest,
  cancelPrescriptionRequest,
} from "@/api/Prescription-Request";
import {
  PrescriptionRequest,
  CreatePrescriptionRequestDto,
  CompletePrescriptionRequestDto,
  RejectPrescriptionRequestDto,
} from "@/types/Prescription-Request/Prescription-Request";

// Query Keys
export const prescriptionRequestKeys = {
  all: ["prescriptionRequests"] as const,
  lists: () => [...prescriptionRequestKeys.all, "list"] as const,
  myRequests: () => [...prescriptionRequestKeys.lists(), "my-requests"] as const,
  doctorPending: () => [...prescriptionRequestKeys.lists(), "doctor-pending"] as const,
  doctorHistory: () => [...prescriptionRequestKeys.lists(), "doctor-history"] as const,
  details: () => [...prescriptionRequestKeys.all, "detail"] as const,
  detail: (id: string) => [...prescriptionRequestKeys.details(), id] as const,
};

// Get My Prescription Requests (Patient)
export const useMyPrescriptionRequests = (enabled: boolean = true) => {
  return useQuery<PrescriptionRequest[]>({
    queryKey: prescriptionRequestKeys.myRequests(),
    queryFn: getMyPrescriptionRequests,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get Doctor Pending Requests
export const useDoctorPendingRequests = (enabled: boolean = true) => {
  return useQuery<PrescriptionRequest[]>({
    queryKey: prescriptionRequestKeys.doctorPending(),
    queryFn: getDoctorPendingRequests,
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get Doctor History Requests
export const useDoctorRequestHistory = (enabled: boolean = true) => {
  return useQuery<PrescriptionRequest[]>({
    queryKey: prescriptionRequestKeys.doctorHistory(),
    queryFn: getDoctorRequestHistory,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get Prescription Request by ID
export const usePrescriptionRequest = (id: string, enabled: boolean = true) => {
  return useQuery<PrescriptionRequest>({
    queryKey: prescriptionRequestKeys.detail(id),
    queryFn: () => getPrescriptionRequestById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create Prescription Request (Patient)
export const useCreatePrescriptionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<PrescriptionRequest, Error, CreatePrescriptionRequestDto>({
    mutationFn: createPrescriptionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.myRequests(),
      });
    },
    onError: (error) => {
      console.error("Error creating prescription request:", error);
    },
  });
};

// Take Prescription Request (Doctor)
export const useTakePrescriptionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<PrescriptionRequest, Error, string>({
    mutationFn: takePrescriptionRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(
        prescriptionRequestKeys.detail(String(data.id)),
        data
      );
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.doctorPending(),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.doctorHistory(),
      });
    },
    onError: (error) => {
      console.error("Error taking prescription request:", error);
    },
  });
};

// Complete Prescription Request (Doctor)
export const useCompletePrescriptionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PrescriptionRequest,
    Error,
    { id: string; data: CompletePrescriptionRequestDto }
  >({
    mutationFn: ({ id, data }) => completePrescriptionRequest(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        prescriptionRequestKeys.detail(String(data.id)),
        data
      );
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.doctorPending(),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.doctorHistory(),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.myRequests(),
      });
    },
    onError: (error) => {
      console.error("Error completing prescription request:", error);
    },
  });
};

// Reject Prescription Request (Doctor)
export const useRejectPrescriptionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PrescriptionRequest,
    Error,
    { id: string; data: RejectPrescriptionRequestDto }
  >({
    mutationFn: ({ id, data }) => rejectPrescriptionRequest(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        prescriptionRequestKeys.detail(String(data.id)),
        data
      );
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.doctorPending(),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.doctorHistory(),
      });
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.myRequests(),
      });
    },
    onError: (error) => {
      console.error("Error rejecting prescription request:", error);
    },
  });
};

// Cancel Prescription Request (Patient)
export const useCancelPrescriptionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<PrescriptionRequest, Error, string>({
    mutationFn: cancelPrescriptionRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(
        prescriptionRequestKeys.detail(String(data.id)),
        data
      );
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.myRequests(),
      });
    },
    onError: (error) => {
      console.error("Error cancelling prescription request:", error);
    },
  });
};
