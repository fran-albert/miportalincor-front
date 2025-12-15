import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, RefreshCw } from "lucide-react";
import {
  useMyPrescriptionRequests,
  useCancelPrescriptionRequest,
} from "@/hooks/Prescription-Request/usePrescriptionRequest";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import PrescriptionRequestList from "../List";
import ViewPrescriptionRequestModal from "../View";
import CreatePrescriptionRequestModal from "../Create";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface DoctorOption {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  specialities?: string[];
  notes?: string;
}

interface PatientPrescriptionRequestsProps {
  doctors: DoctorOption[];
  isLoadingDoctors?: boolean;
}

export default function PatientPrescriptionRequests({
  doctors,
  isLoadingDoctors = false,
}: PatientPrescriptionRequestsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<PrescriptionRequest | null>(null);

  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching,
  } = useMyPrescriptionRequests();

  const cancelMutation = useCancelPrescriptionRequest();
  const { promiseToast } = useToastContext();

  const handleView = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleCancel = async (request: PrescriptionRequest) => {
    const confirmed = window.confirm(
      "¿Esta seguro que desea cancelar esta solicitud?"
    );
    if (!confirmed) return;

    const promise = cancelMutation.mutateAsync(String(request.id));

    await promiseToast(promise, {
      loading: {
        title: "Cancelando solicitud...",
        description: "Procesando la cancelacion",
      },
      success: {
        title: "Solicitud cancelada",
        description: "Su solicitud ha sido cancelada correctamente",
      },
      error: (error: unknown) => ({
        title: "Error al cancelar",
        description:
          (error instanceof Error ? error.message : undefined) ||
          "No se pudo cancelar la solicitud",
      }),
    });

    setIsViewModalOpen(false);
  };

  const LoadingSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-l-4 border-l-gray-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-greenPrimary to-teal-600 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Mis Solicitudes de Recetas</CardTitle>
                <p className="text-sm text-white/80 mt-1">
                  Gestione sus solicitudes de recetas medicas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white text-greenPrimary hover:bg-white/90 shadow-md"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva Solicitud
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <PrescriptionRequestList
              requests={requests}
              userRole="patient"
              onView={handleView}
              onCancel={handleCancel}
              isLoading={cancelMutation.isPending}
              emptyMessage="No tiene solicitudes de recetas"
            />
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <CreatePrescriptionRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        doctors={doctors}
        isLoadingDoctors={isLoadingDoctors}
      />

      {/* View Modal */}
      <ViewPrescriptionRequestModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        userRole="patient"
        onCancel={handleCancel}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
