import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Pill,
  Download,
  Clock,
  CalendarDays,
  RefreshCw,
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PhysicalGreenCard } from "@/components/Green-Card/PhysicalGreenCard";
import { RequestPrescriptionModal } from "@/components/Green-Card/RequestPrescriptionModal";
import { useMyGreenCard } from "@/hooks/Green-Card/useGreenCard";
import { useGreenCardPDF } from "@/hooks/Green-Card/useGreenCardPDF";
import { useMyPrescriptionRequests } from "@/hooks/Prescription-Request/usePrescriptionRequest";
import { GreenCardItem } from "@/types/Green-Card/GreenCard";
import {
  PrescriptionRequest,
  PrescriptionRequestStatus,
} from "@/types/Prescription-Request/Prescription-Request";

const MyPrescriptionRequestsPage = () => {
  // State for prescription request modal
  const [selectedItemForPrescription, setSelectedItemForPrescription] =
    useState<GreenCardItem | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  // Green Card data (single card per patient)
  const {
    greenCard,
    isLoading: isLoadingCard,
    refetch,
    isFetching,
  } = useMyGreenCard();
  const { generatePDF, isGenerating } = useGreenCardPDF();

  // Prescription Requests history
  const { data: prescriptionRequests = [], isLoading: isLoadingRequests } =
    useMyPrescriptionRequests();

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Medicación y Recetas" },
  ];

  const handleDownloadPDF = async () => {
    if (greenCard) {
      await generatePDF({ greenCard });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleRequestPrescription = (item: GreenCardItem) => {
    setSelectedItemForPrescription(item);
    setIsPrescriptionModalOpen(true);
  };

  const handleClosePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
    setSelectedItemForPrescription(null);
  };

  const getStatusBadge = (status: PrescriptionRequestStatus) => {
    switch (status) {
      case PrescriptionRequestStatus.PENDING:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case PrescriptionRequestStatus.IN_PROGRESS:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            En proceso
          </Badge>
        );
      case PrescriptionRequestStatus.COMPLETED:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completada
          </Badge>
        );
      case PrescriptionRequestStatus.REJECTED:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazada
          </Badge>
        );
      case PrescriptionRequestStatus.CANCELLED:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "";
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return "";
    }
  };

  const getDoctorName = (request: PrescriptionRequest) => {
    if (!request.doctor) return "Médico";
    const prefix = request.doctor.gender === "Femenino" ? "Dra." : "Dr.";
    return `${prefix} ${request.doctor.firstName} ${request.doctor.lastName}`;
  };

  // Sort requests: pending first, then by date
  const sortedRequests = [...prescriptionRequests].sort((a, b) => {
    const statusOrder = {
      [PrescriptionRequestStatus.PENDING]: 0,
      [PrescriptionRequestStatus.IN_PROGRESS]: 1,
      [PrescriptionRequestStatus.COMPLETED]: 2,
      [PrescriptionRequestStatus.REJECTED]: 3,
      [PrescriptionRequestStatus.CANCELLED]: 4,
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const pendingCount = prescriptionRequests.filter(
    (r) =>
      r.status === PrescriptionRequestStatus.PENDING ||
      r.status === PrescriptionRequestStatus.IN_PROGRESS
  ).length;

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Medicación y Recetas</title>
        <meta
          name="description"
          content="Consulta tu medicación habitual y gestiona tus solicitudes de recetas"
        />
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Medicación y Recetas"
        description="Consultá tu medicación habitual y solicitá recetas a tus médicos"
        icon={<Pill className="h-6 w-6" />}
      />

      {/* Important Notice - Friday Digital Availability */}
      <Alert className="border-amber-300 bg-amber-50">
        <CalendarDays className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800 font-semibold">
          Disponibilidad de recetas
        </AlertTitle>
        <AlertDescription className="text-amber-700">
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4" />
            <span>
              Las recetas solicitadas estarán disponibles{" "}
              <strong>todos los viernes a partir de las 14:00 hs</strong>. Una
              vez procesada, podrá descargar su receta digital directamente
              desde este portal.
            </span>
          </div>
        </AlertDescription>
      </Alert>

      {/* Green Card Section */}
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Pill className="h-5 w-5 text-green-600" />
            Mi Cartón Verde
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
            {greenCard && greenCard.items.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="bg-green-700 hover:bg-green-800"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? "Generando..." : "Descargar PDF"}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoadingCard ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Cargando tu cartón verde...</p>
            </CardContent>
          </Card>
        ) : greenCard && greenCard.items.length > 0 ? (
          <PhysicalGreenCard
            greenCard={greenCard}
            onRequestPrescription={handleRequestPrescription}
          />
        ) : (
          <Card className="border-dashed border-2 border-green-300">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Tu cartón está vacío
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Aún no tenés medicación habitual registrada. Cuando un médico te
                indique medicación regular, aparecerá aquí automáticamente.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Prescription Requests History */}
      <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-5 w-5 text-blue-600" />
                  Historial de Solicitudes
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                {isHistoryOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {isLoadingRequests ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="text-gray-500 text-sm">Cargando historial...</p>
                </div>
              ) : sortedRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Aún no tenés solicitudes de recetas.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Cuando solicites una receta desde tu cartón verde, aparecerá
                    aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">
                            {request.description}
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          <span>{getDoctorName(request)}</span>
                          {request.doctor?.specialities?.[0] && (
                            <span className="text-gray-400">
                              {" "}
                              · {request.doctor.specialities[0]}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          Solicitado {formatRelativeTime(request.createdAt || "")}
                          {request.completedAt && (
                            <span>
                              {" "}
                              · Completado el {formatDate(request.completedAt)}
                            </span>
                          )}
                        </div>
                        {request.rejectedReason && (
                          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Motivo del rechazo:</strong>{" "}
                            {request.rejectedReason}
                          </div>
                        )}
                      </div>
                      {request.status === PrescriptionRequestStatus.COMPLETED &&
                        (request.prescriptionUrls?.length ?? 0) > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-4 text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => {
                              if (request.prescriptionUrls?.[0]) {
                                window.open(request.prescriptionUrls[0], "_blank");
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </Button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Request Prescription Modal */}
      {greenCard && selectedItemForPrescription && (
        <RequestPrescriptionModal
          isOpen={isPrescriptionModalOpen}
          onClose={handleClosePrescriptionModal}
          greenCardId={greenCard.id}
          item={selectedItemForPrescription}
        />
      )}
    </div>
  );
};

export default MyPrescriptionRequestsPage;
