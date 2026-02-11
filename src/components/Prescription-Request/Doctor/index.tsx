import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  RefreshCw,
  Clock,
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  useTakePrescriptionRequest,
} from "@/hooks/Prescription-Request/usePrescriptionRequest";
import {
  useSearchDoctorPendingRequests,
  useSearchDoctorHistoryRequests,
} from "@/hooks/Prescription-Request/useSearchDoctorPrescriptionRequests";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import PrescriptionRequestCard from "../Card";
import BatchPrescriptionRequestCard from "../BatchCard";
import ViewPrescriptionRequestModal from "../View";
import CompletePrescriptionRequestModal from "../Complete";
import CompleteBatchModal from "../CompleteBatch";
import RejectPrescriptionRequestModal from "../Reject";
import { useToastContext } from "@/hooks/Toast/toast-context";

/** Groups an array of requests: those sharing a batchId are grouped together, others stay individual. */
function groupRequests(requests: PrescriptionRequest[]) {
  const batches = new Map<string, PrescriptionRequest[]>();
  const individual: PrescriptionRequest[] = [];

  for (const req of requests) {
    if (req.batchId) {
      const existing = batches.get(req.batchId) || [];
      existing.push(req);
      batches.set(req.batchId, existing);
    } else {
      individual.push(req);
    }
  }

  // Build ordered list: batches first (by first item order), then individuals
  const groups: Array<
    | { type: "batch"; batchId: string; requests: PrescriptionRequest[] }
    | { type: "individual"; request: PrescriptionRequest }
  > = [];

  for (const [batchId, reqs] of batches) {
    groups.push({ type: "batch", batchId, requests: reqs });
  }
  for (const req of individual) {
    groups.push({ type: "individual", request: req });
  }

  return groups;
}

export default function DoctorPrescriptionRequests() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCompleteBatchModalOpen, setIsCompleteBatchModalOpen] =
    useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<PrescriptionRequest | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatchRequests, setSelectedBatchRequests] = useState<
    PrescriptionRequest[]
  >([]);

  // Paginated search hooks
  const {
    requests: pendingRequests,
    total: pendingTotal,
    page: pendingPage,
    totalPages: pendingTotalPages,
    hasNextPage: pendingHasNext,
    hasPreviousPage: pendingHasPrev,
    search: pendingSearch,
    setSearch: setPendingSearch,
    nextPage: pendingNextPage,
    prevPage: pendingPrevPage,
    isLoading: isLoadingPending,
    isFetching: isFetchingPending,
    refetch: refetchPending,
  } = useSearchDoctorPendingRequests({ initialLimit: 20 });

  const {
    requests: historyRequests,
    total: historyTotal,
    page: historyPage,
    totalPages: historyTotalPages,
    hasNextPage: historyHasNext,
    hasPreviousPage: historyHasPrev,
    search: historySearch,
    setSearch: setHistorySearch,
    nextPage: historyNextPage,
    prevPage: historyPrevPage,
    isLoading: isLoadingHistory,
    isFetching: isFetchingHistory,
    refetch: refetchHistory,
  } = useSearchDoctorHistoryRequests({ initialLimit: 20 });

  const takeMutation = useTakePrescriptionRequest();
  const { promiseToast } = useToastContext();

  // Group requests by batchId
  const pendingGroups = useMemo(
    () => groupRequests(pendingRequests),
    [pendingRequests]
  );
  const historyGroups = useMemo(
    () => groupRequests(historyRequests),
    [historyRequests]
  );

  const [viewBatchRequests, setViewBatchRequests] = useState<
    PrescriptionRequest[]
  >([]);

  const handleView = (
    request: PrescriptionRequest,
    batchRequests?: PrescriptionRequest[]
  ) => {
    setSelectedRequest(request);
    setViewBatchRequests(batchRequests || []);
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

  const handleTakeBatch = async (
    _batchId: string,
    requests: PrescriptionRequest[]
  ) => {
    // Take each request in the batch sequentially
    for (const req of requests) {
      if (
        req.status === "PENDING"
      ) {
        await handleTake(req);
      }
    }
  };

  const handleComplete = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteBatch = (
    batchId: string,
    requests: PrescriptionRequest[]
  ) => {
    setSelectedBatchId(batchId);
    setSelectedBatchRequests(requests);
    setIsCompleteBatchModalOpen(true);
  };

  const handleReject = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const handleRejectBatch = async (
    _batchId: string,
    requests: PrescriptionRequest[]
  ) => {
    // For batch reject, open the reject modal with the first request
    // The doctor can reject individually or we can handle the first one
    if (requests.length > 0) {
      setSelectedRequest(requests[0]);
      setIsRejectModalOpen(true);
    }
  };

  const handleRefresh = () => {
    if (activeTab === "pending") {
      refetchPending();
    } else {
      refetchHistory();
    }
  };

  const isRefreshing =
    activeTab === "pending" ? isFetchingPending : isFetchingHistory;

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

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-sm text-gray-500">
        Cuando un paciente solicite una receta, aparecera aqui
      </p>
    </div>
  );

  const PaginationControls = ({
    page,
    totalPages,
    total,
    hasNext,
    hasPrev,
    onNext,
    onPrev,
    isFetching,
  }: {
    page: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    onNext: () => void;
    onPrev: () => void;
    isFetching: boolean;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {total} solicitud{total !== 1 ? "es" : ""} en total
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={!hasPrev || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 px-2">
            Pagina {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNext || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderGroups = (
    groups: ReturnType<typeof groupRequests>,
    showActions: boolean
  ) => {
    if (groups.length === 0) {
      return (
        <EmptyState
          message={
            showActions
              ? "No hay solicitudes pendientes"
              : "No hay historial de solicitudes"
          }
        />
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {groups.map((group) => {
          if (group.type === "batch") {
            return (
              <BatchPrescriptionRequestCard
                key={`batch-${group.batchId}`}
                batchId={group.batchId}
                requests={group.requests}
                userRole="doctor"
                onView={handleView}
                onTakeBatch={showActions ? handleTakeBatch : undefined}
                onCompleteBatch={showActions ? handleCompleteBatch : undefined}
                onRejectBatch={showActions ? handleRejectBatch : undefined}
                isLoading={takeMutation.isPending}
              />
            );
          }
          return (
            <PrescriptionRequestCard
              key={group.request.id}
              request={group.request}
              userRole="doctor"
              onView={handleView}
              onTake={showActions ? handleTake : undefined}
              onComplete={showActions ? handleComplete : undefined}
              onReject={showActions ? handleReject : undefined}
              isLoading={takeMutation.isPending}
            />
          );
        })}
      </div>
    );
  };

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
                {pendingTotal > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {pendingTotal}
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
              <TabsContent value="pending" className="mt-0 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre del paciente..."
                    value={pendingSearch}
                    onChange={(e) => setPendingSearch(e.target.value)}
                    className="pl-10"
                  />
                  {isFetchingPending && !isLoadingPending && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {isLoadingPending ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    {renderGroups(pendingGroups, true)}
                    <PaginationControls
                      page={pendingPage}
                      totalPages={pendingTotalPages}
                      total={pendingTotal}
                      hasNext={pendingHasNext}
                      hasPrev={pendingHasPrev}
                      onNext={pendingNextPage}
                      onPrev={pendingPrevPage}
                      isFetching={isFetchingPending}
                    />
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre del paciente..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-10"
                  />
                  {isFetchingHistory && !isLoadingHistory && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {isLoadingHistory ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    {renderGroups(historyGroups, false)}
                    <PaginationControls
                      page={historyPage}
                      totalPages={historyTotalPages}
                      total={historyTotal}
                      hasNext={historyHasNext}
                      hasPrev={historyHasPrev}
                      onNext={historyNextPage}
                      onPrev={historyPrevPage}
                      isFetching={isFetchingHistory}
                    />
                  </>
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
          setViewBatchRequests([]);
        }}
        request={selectedRequest}
        batchRequests={viewBatchRequests.length > 1 ? viewBatchRequests : undefined}
        userRole="doctor"
      />

      {/* Complete Modal (individual) */}
      <CompletePrescriptionRequestModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      {/* Complete Batch Modal */}
      {selectedBatchId && (
        <CompleteBatchModal
          isOpen={isCompleteBatchModalOpen}
          onClose={() => {
            setIsCompleteBatchModalOpen(false);
            setSelectedBatchId(null);
            setSelectedBatchRequests([]);
          }}
          batchId={selectedBatchId}
          requests={selectedBatchRequests}
        />
      )}

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
