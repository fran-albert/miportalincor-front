import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDoctorPendingCount, getDoctorPendingRequests } from "@/api/Prescription-Request";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import { prescriptionRequestKeys } from "./usePrescriptionRequest";

const POLLING_INTERVAL = 30 * 1000; // 30 seconds

export const prescriptionNotificationKeys = {
  pendingCount: ["prescriptionRequests", "pendingCount"] as const,
};

interface UsePrescriptionNotificationsOptions {
  enabled?: boolean;
  showToasts?: boolean;
}

export const usePrescriptionNotifications = (
  options: UsePrescriptionNotificationsOptions = {}
) => {
  const { enabled = true, showToasts = true } = options;
  const previousCountRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  // Query for pending count with polling
  const {
    data: countData,
    isLoading,
    error,
  } = useQuery({
    queryKey: prescriptionNotificationKeys.pendingCount,
    queryFn: getDoctorPendingCount,
    enabled,
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false, // Don't poll when tab is not active
    staleTime: 15 * 1000, // Consider data stale after 15 seconds
  });

  const pendingCount = countData?.count ?? 0;

  // Show toast when count increases
  useEffect(() => {
    if (!showToasts || isLoading || error) return;

    // Skip first render (when previous count is null)
    if (previousCountRef.current === null) {
      previousCountRef.current = pendingCount;
      return;
    }

    // Check if count increased
    const previousCount = previousCountRef.current;
    if (pendingCount > previousCount) {
      const newRequests = pendingCount - previousCount;
      const message =
        newRequests === 1
          ? "Nueva solicitud de receta"
          : `${newRequests} nuevas solicitudes de recetas`;

      toast.info(message, {
        description: "Tenés solicitudes pendientes de pacientes",
        action: {
          label: "Ver",
          onClick: () => {
            window.location.href = "/solicitudes-recetas";
          },
        },
        duration: 5000,
      });

      // Invalidate the pending requests list to refresh it
      queryClient.invalidateQueries({
        queryKey: prescriptionRequestKeys.doctorPending(),
      });
    }

    previousCountRef.current = pendingCount;
  }, [pendingCount, showToasts, isLoading, error, queryClient]);

  return {
    pendingCount,
    isLoading,
    hasPendingRequests: pendingCount > 0,
    error,
  };
};

// Hook to get the latest pending requests for the dropdown
export const useLatestPendingRequests = (
  enabled: boolean = true,
  limit: number = 5
) => {
  const { data, isLoading, error } = useQuery<PrescriptionRequest[]>({
    queryKey: [...prescriptionRequestKeys.doctorPending(), "latest", limit],
    queryFn: async () => {
      const requests = await getDoctorPendingRequests();
      // Return only the first N requests (oldest first as they need attention)
      return requests.slice(0, limit);
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    requests: data ?? [],
    isLoading,
    error,
  };
};
