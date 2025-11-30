import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, User, Pill, Plus, FileDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import CreateCurrentMedicationModal from "@/components/Current-Medication/Create";
import EditCurrentMedicationModal from "@/components/Current-Medication/Edit";
import ViewMedicacionActualModal from "@/components/Current-Medication/View-Simple";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { useMedicacionActual } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import useUserRole from "@/hooks/useRoles";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { formatDateArgentina } from "@/common/helpers/helpers";
import { useMedicacionActualPDF } from "@/hooks/Current-Medication/useMedicacionActualPDF";

type UserData = Patient | Doctor;

interface MedicacionActualComponentProps {
  onBack: () => void;
  userData: UserData;
  userType: "patient" | "doctor";
  currentUserType: "patient" | "doctor";
  patient?: Patient;
}

export default function MedicacionActualComponent({
  onBack,
  userData,
  userType,
  currentUserType,
  patient,
}: MedicacionActualComponentProps) {
  const { session } = useUserRole();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);
  const [selectedMedicationToView, setSelectedMedicationToView] =
    useState<MedicacionActual | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Get ALL medications para mostrar historial
  const queryParams = {
    status: "ALL" as const,
    includeDoctor: true,
    orderBy: "startDate" as const,
    orderDirection: "DESC" as const,
  };

  const {
    medicacionActual,
    isLoading: isLoadingMedications,
    error: medicationsError,
  } = useMedicacionActual({
    auth: true,
    userId: userData.userId,
    queryParams,
  });

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!session?.id,
    id: session?.id || "0",
  });

  // Hook para generar PDF
  const { generatePDF, isGenerating } = useMedicacionActualPDF();

  // Check if all data is loaded for modal
  const isModalDataReady = !isLoadingDoctor && doctor;

  // Separar medicación activa y suspendidas
  const currentMedication =
    medicacionActual && medicacionActual.length > 0
      ? medicacionActual.find((m) => m.status === "ACTIVE") || null
      : null;

  const suspendedMedications =
    medicacionActual && medicacionActual.length > 0
      ? medicacionActual
          .filter((m) => m.status === "SUSPENDED")
          .sort((a, b) => {
            // Ordenar por fecha de suspensión descendente
            const dateA = new Date(a.suspensionDate || a.createdAt).getTime();
            const dateB = new Date(b.suspensionDate || b.createdAt).getTime();
            return dateB - dateA;
          })
      : [];

  // Effect to open modal when data is ready
  useEffect(() => {
    if (wantsToOpenModal && isModalDataReady) {
      // Si hay medicación actual, abrir modal de edición, sino de creación
      if (currentMedication) {
        setIsEditModalOpen(true);
      } else {
        setIsAddModalOpen(true);
      }
      setWantsToOpenModal(false);
    }
  }, [wantsToOpenModal, isModalDataReady, currentMedication]);

  const handleOpenModal = () => {
    setWantsToOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setWantsToOpenModal(false);
  };

  const handleMedicationClick = (medication: MedicacionActual) => {
    setSelectedMedicationToView(medication);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMedicationToView(null);
  };

  // Breadcrumb items
  const breadcrumbItems = patient
    ? [
        { label: "Home", href: "/home" },
        { label: "Pacientes", href: "/pacientes" },
        {
          label: `${patient.firstName} ${patient.lastName}`,
          href: `/pacientes/${patient.slug}`,
        },
        {
          label: "Historia Clínica",
          href: `/pacientes/${patient.slug}/historia-clinica`,
        },
        {
          label: "Medicación Actual",
          icon: <Pill className="h-4 w-4" />,
        },
      ]
    : [];

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb */}
      {patient && <BreadcrumbComponent items={breadcrumbItems} />}

      {/* Header */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-greenPrimary to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-white/20 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Pill className="h-6 w-6" />
                Medicación Actual
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {patient && (
                <Button
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                  onClick={() =>
                    generatePDF({
                      patient,
                      medicacionActual: currentMedication,
                      historialMedicaciones: suspendedMedications,
                    })
                  }
                  disabled={isGenerating || (!currentMedication && suspendedMedications.length === 0)}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-2" />
                  )}
                  Exportar PDF
                </Button>
              )}
              {currentUserType === "doctor" && (
                <Button
                  className="bg-white text-greenPrimary hover:bg-white/90"
                  onClick={handleOpenModal}
                  disabled={wantsToOpenModal}
                >
                  {wantsToOpenModal ? (
                    <div className="w-4 h-4 border-2 border-greenPrimary border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {currentMedication ? "Actualizar" : "Agregar"} Medicación
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Medicación Actual */}
      <div>
        {isLoadingMedications ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-greenPrimary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Cargando medicación...</p>
            </CardContent>
          </Card>
        ) : medicationsError ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-500">Error al cargar la medicación</p>
            </CardContent>
          </Card>
        ) : !currentMedication ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">
                No hay medicación registrada
              </p>
              <p className="text-gray-400 text-sm">
                {currentUserType === "doctor"
                  ? "Haz clic en 'Agregar Medicación' para registrar la medicación actual del paciente"
                  : "No se encontró medicación registrada"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-greenPrimary"
            onClick={() => handleMedicationClick(currentMedication)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-greenPrimary" />
                      <span className="font-medium">
                        {formatDateArgentina(currentMedication.startDate)}
                      </span>
                    </div>
                    {currentMedication.doctor && (
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          Dr. {currentMedication.doctor.firstName}{" "}
                          {currentMedication.doctor.lastName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {currentMedication.medicationName && (
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {currentMedication.medicationName}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {currentMedication.dosage && (
                    <div className="bg-greenPrimary/10 p-2 rounded-md border border-greenPrimary/20">
                      <Label className="text-xs font-semibold text-greenPrimary uppercase tracking-wide">
                        Dosis
                      </Label>
                      <p className="text-sm text-gray-800 mt-0.5 font-medium">
                        {currentMedication.dosage}
                      </p>
                    </div>
                  )}

                  {currentMedication.frequency && (
                    <div className="bg-greenPrimary/10 p-2 rounded-md border border-greenPrimary/20">
                      <Label className="text-xs font-semibold text-greenPrimary uppercase tracking-wide">
                        Frecuencia
                      </Label>
                      <p className="text-sm text-gray-800 mt-0.5 font-medium">
                        {currentMedication.frequency}
                      </p>
                    </div>
                  )}
                </div>

                {currentMedication.observations && (
                  <div className="pt-2 border-t border-gray-100">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Observaciones
                    </Label>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed line-clamp-2">
                      {currentMedication.observations}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Historial de Medicaciones Suspendidas */}
      {suspendedMedications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Historial de Medicaciones
              </h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {suspendedMedications.length}
              </span>
            </div>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="space-y-3">
            {suspendedMedications.map((medication) => (
              <Card
                key={medication.id}
                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-gray-400"
                onClick={() => handleMedicationClick(medication)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {medication.medicationName && (
                          <p className="text-sm font-bold text-gray-800">
                            {medication.medicationName}
                          </p>
                        )}
                        {medication.observations && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                            {medication.observations}
                          </p>
                        )}
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
                        Suspendida
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span className="font-medium">
                          Inicio: {formatDateArgentina(medication.startDate)}
                        </span>
                      </div>
                      {medication.suspensionDate && (
                        <div className="flex items-center gap-1 text-red-600">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="font-medium">
                            Suspensión:{" "}
                            {formatDateArgentina(medication.suspensionDate)}
                          </span>
                        </div>
                      )}
                      {medication.doctor && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            Dr. {medication.doctor.firstName}{" "}
                            {medication.doctor.lastName}
                          </span>
                        </div>
                      )}
                    </div>

                    {medication.suspensionReason && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold text-gray-900">
                            Motivo:
                          </span>{" "}
                          {medication.suspensionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Crear Medicación */}
      {currentUserType === "doctor" && (
        <CreateCurrentMedicationModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          userData={userData}
          userType={userType}
          doctor={doctor}
        />
      )}

      {/* Modal para Editar Medicación */}
      {currentUserType === "doctor" && currentMedication && (
        <EditCurrentMedicationModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          medication={currentMedication}
          userType={currentUserType}
        />
      )}

      {/* Modal para Ver Medicación */}
      <ViewMedicacionActualModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        medication={selectedMedicationToView}
        userType={currentUserType}
        showActions={currentUserType === "doctor"}
      />
    </div>
  );
}
