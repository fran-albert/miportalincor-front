import { useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getOperatorPendingCount } from "@/api/Prescription-Request";

const POLLING_INTERVAL = 30 * 1000; // 30 seconds

export const operatorPrescriptionNotificationKeys = {
  pendingCount: ["prescriptionRequests", "operator", "pendingCount"] as const,
};

interface UseOperatorPrescriptionNotificationsOptions {
  enabled?: boolean;
  showToasts?: boolean;
}

export const useOperatorPrescriptionNotifications = (
  options: UseOperatorPrescriptionNotificationsOptions = {}
) => {
  const { enabled = true, showToasts = true } = options;
  const previousCountRef = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleNavigate = useCallback(() => {
    navigate("/bandeja-recetas");
  }, [navigate]);

  // Query for pending count with polling
  const {
    data: countData,
    isLoading,
    error,
  } = useQuery({
    queryKey: operatorPrescriptionNotificationKeys.pendingCount,
    queryFn: getOperatorPendingCount,
    enabled,
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
    staleTime: 15 * 1000,
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
        description: "Hay solicitudes pendientes en la bandeja de recetas",
        action: {
          label: "Ver",
          onClick: handleNavigate,
        },
        duration: 5000,
      });

      // Invalidate the operator pending requests list to refresh it
      queryClient.invalidateQueries({
        queryKey: ["operator-pending-search"],
      });
    }

    previousCountRef.current = pendingCount;
  }, [pendingCount, showToasts, isLoading, error, queryClient, handleNavigate]);

  return {
    pendingCount,
    isLoading,
    hasPendingRequests: pendingCount > 0,
    error,
  };
};
