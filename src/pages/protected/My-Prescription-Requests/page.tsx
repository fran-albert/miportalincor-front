import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Pill,
  ClipboardList,
  Download,
  Clock,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PhysicalGreenCard } from "@/components/Green-Card/PhysicalGreenCard";
import { RequestPrescriptionModal } from "@/components/Green-Card/RequestPrescriptionModal";
import PatientPrescriptionRequests from "@/components/Prescription-Request/Patient";
import { useMyGreenCard } from "@/hooks/Green-Card/useGreenCard";
import { useGreenCardPDF } from "@/hooks/Green-Card/useGreenCardPDF";
import { useAvailableDoctorsForPrescriptions } from "@/hooks/Doctor-Settings/useDoctorSettings";
import { GreenCardItem } from "@/types/Green-Card/GreenCard";

const MyPrescriptionRequestsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "medicacion";
  const [activeTab, setActiveTab] = useState(initialTab);

  // State for prescription request modal
  const [selectedItemForPrescription, setSelectedItemForPrescription] = useState<GreenCardItem | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  // Green Card data (single card per patient)
  const { greenCard, isLoading: isLoadingCard, refetch, isFetching } = useMyGreenCard();
  const { generatePDF, isGenerating } = useGreenCardPDF();

  // Prescription Requests data
  const {
    data: availableDoctors = [],
    isLoading: isLoadingDoctors,
  } = useAvailableDoctorsForPrescriptions();

  const doctorOptions = availableDoctors.map((doctor) => ({
    id: doctor.id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    gender: doctor.gender,
    specialities: doctor.specialities?.map((s) => s.name) || [],
    notes: doctor.notes,
  }));

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Medicación y Recetas" },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

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
        description="Consulta tu medicación habitual y gestiona tus solicitudes de recetas"
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
              <strong>todos los viernes a partir de las 14:00 hs</strong>.
              Una vez procesada, podrá descargar su receta digital directamente desde este portal.
            </span>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-gray-100">
          <TabsTrigger
            value="medicacion"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Pill className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Mi Medicación</span>
              <span className="text-xs opacity-80 hidden sm:block">Cartón Verde</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="solicitudes"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <ClipboardList className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Solicitudes</span>
              <span className="text-xs opacity-80 hidden sm:block">Pedir Recetas</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Mi Medicación (Cartón Verde) */}
        <TabsContent value="medicacion" className="mt-6">
          <div className="space-y-4">
            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
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
                    Aún no tenés medicación habitual registrada. Cuando un médico te indique
                    medicación regular, aparecerá aquí automáticamente.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Solicitudes de Recetas */}
        <TabsContent value="solicitudes" className="mt-6">
          {/* Explanation Card */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-600 p-3 flex-shrink-0">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    ¿Cómo solicitar una receta?
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Podés solicitar recetas de dos formas:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-blue-900">
                          Desde tu Cartón Verde
                        </span>
                      </div>
                      <p className="text-blue-700 text-xs">
                        Andá a la pestaña "Mi Medicación" y hacé clic en
                        "Solicitar Receta" junto al medicamento.
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Nueva solicitud manual
                        </span>
                      </div>
                      <p className="text-blue-700 text-xs">
                        Usá el botón "Nueva Solicitud" para pedir cualquier receta
                        escribiendo los detalles del medicamento.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Requests Component */}
          <PatientPrescriptionRequests
            doctors={doctorOptions}
            isLoadingDoctors={isLoadingDoctors}
          />
        </TabsContent>
      </Tabs>

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
