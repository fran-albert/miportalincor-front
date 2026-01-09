import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, RefreshCw, Clock, History } from "lucide-react";
import {
  useDoctorPendingRequests,
  useDoctorRequestHistory,
  useTakePrescriptionRequest,
} from "@/hooks/Prescription-Request/usePrescriptionRequest";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import PrescriptionRequestList from "../List";
import ViewPrescriptionRequestModal from "../View";
import CompletePrescriptionRequestModal from "../Complete";
import RejectPrescriptionRequestModal from "../Reject";
import { useToastContext } from "@/hooks/Toast/toast-context";

export default function DoctorPrescriptionRequests() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<PrescriptionRequest | null>(null);

  const {
    data: pendingRequests = [],
    isLoading: isLoadingPending,
    refetch: refetchPending,
    isRefetching: isRefetchingPending,
  } = useDoctorPendingRequests();

  const {
    data: historyRequests = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
    isRefetching: isRefetchingHistory,
  } = useDoctorRequestHistory();

  const takeMutation = useTakePrescriptionRequest();
  const { promiseToast } = useToastContext();

  const handleView = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleTake = async (request: PrescriptionRequest) => {
    const promise = takeMutation.mutateAsync(String(request.id));

    await promiseToast(promise, {
      loading: {
        title: "Tomando solicitud...",
        description: "Procesando",
      },
      success: {
        title: "Solicitud tomada",
        description: "Ahora puede completar o rechazar esta solicitud",
      },
      error: (error: unknown) => ({
        title: "Error al tomar",
        description:
          (error instanceof Error ? error.message : undefined) ||
          "No se pudo tomar la solicitud",
      }),
    });
  };

  const handleComplete = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setIsCompleteModalOpen(true);
  };

  const handleReject = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleRefresh = () => {
    if (activeTab === "pending") {
      refetchPending();
    } else {
      refetchHistory();
    }
  };

  const isRefreshing =
    activeTab === "pending" ? isRefetchingPending : isRefetchingHistory;

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Solicitudes de Recetas
                </CardTitle>
                <p className="text-sm text-white/80 mt-1">
                  Gestione las solicitudes de recetas de sus pacientes
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="pending"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-greenPrimary data-[state=active]:text-greenPrimary data-[state=active]:shadow-none"
              >
                <Clock className="h-4 w-4 mr-2" />
                Pendientes
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-greenPrimary data-[state=active]:text-greenPrimary data-[state=active]:shadow-none"
              >
                <History className="h-4 w-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="pending" className="mt-0">
                {isLoadingPending ? (
                  <LoadingSkeleton />
                ) : (
                  <PrescriptionRequestList
                    requests={pendingRequests}
                    userRole="doctor"
                    onView={handleView}
                    onTake={handleTake}
                    onComplete={handleComplete}
                    onReject={handleReject}
                    isLoading={takeMutation.isPending}
                    emptyMessage="No hay solicitudes pendientes"
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {isLoadingHistory ? (
                  <LoadingSkeleton />
                ) : (
                  <PrescriptionRequestList
                    requests={historyRequests}
                    userRole="doctor"
                    onView={handleView}
                    emptyMessage="No hay historial de solicitudes"
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Modal */}
      <ViewPrescriptionRequestModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        userRole="doctor"
      />

      {/* Complete Modal */}
      <CompletePrescriptionRequestModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      {/* Reject Modal */}
      <RejectPrescriptionRequestModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />
    </div>
  );
}
