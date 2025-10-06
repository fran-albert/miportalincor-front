import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  User,
  Pill,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import CreateCurrentMedicationModal from "@/components/Current-Medication/Create";
import EditCurrentMedicationModal from "@/components/Current-Medication/Edit";
import ViewMedicacionActualModal from "@/components/Current-Medication/View-Simple";
import { useMedicacionActual } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import useUserRole from "@/hooks/useRoles";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";
import { formatDateArgentina, formatDateTimeArgentina } from "@/common/helpers/helpers";

type UserData = Patient | Doctor;

interface MedicacionActualComponentProps {
  onBack: () => void;
  userData: UserData;
  userType: "patient" | "doctor";
  currentUserType: "patient" | "doctor";
}

export default function MedicacionActualComponent({
  onBack,
  userData,
  userType,
  currentUserType,
}: MedicacionActualComponentProps) {
  const { session } = useUserRole();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);
  const [selectedMedicationToView, setSelectedMedicationToView] = useState<MedicacionActual | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Get ALL medications para mostrar historial
  const queryParams = {
    status: 'ALL' as const,
    includeDoctor: true,
    orderBy: 'startDate' as const,
    orderDirection: 'DESC' as const
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
    id: parseInt(session?.id || "0"),
  });

  // Check if all data is loaded for modal
  const isModalDataReady = !isLoadingDoctor && doctor;

  // Separar medicación activa y suspendidas
  const currentMedication = medicacionActual && medicacionActual.length > 0
    ? medicacionActual.find(m => m.status === 'ACTIVE') || null
    : null;

  const suspendedMedications = medicacionActual && medicacionActual.length > 0
    ? medicacionActual.filter(m => m.status === 'SUSPENDED').sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="hover:bg-white/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Pill className="h-6 w-6 text-purple-600" />
                  Medicación Actual
                </CardTitle>
              </div>
              {currentUserType === 'doctor' && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleOpenModal}
                  disabled={wantsToOpenModal}
                >
                  {wantsToOpenModal ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {currentMedication ? 'Actualizar' : 'Agregar'} Medicación
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Medicación Actual */}
        <div>
          {isLoadingMedications ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
                <p className="text-gray-500 font-medium mb-2">No hay medicación registrada</p>
                <p className="text-gray-400 text-sm">
                  {currentUserType === 'doctor'
                    ? "Haz clic en 'Agregar Medicación' para registrar la medicación actual del paciente"
                    : "No se encontró medicación registrada"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div
                  className="cursor-pointer"
                  onClick={() => handleMedicationClick(currentMedication)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      Registrado: {formatDateTimeArgentina(currentMedication.startDate)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Medication Info */}
                    {currentMedication.medicationName && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Medicamento</Label>
                        <p className="text-base font-semibold text-gray-900 mt-1">
                          {currentMedication.medicationName}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentMedication.dosage && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Dosis</Label>
                          <p className="text-sm text-gray-800 mt-1">{currentMedication.dosage}</p>
                        </div>
                      )}

                      {currentMedication.frequency && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Frecuencia</Label>
                          <p className="text-sm text-gray-800 mt-1">{currentMedication.frequency}</p>
                        </div>
                      )}
                    </div>

                    {currentMedication.observations && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Observaciones</Label>
                        <p className="text-sm text-gray-800 mt-1 leading-relaxed">
                          {currentMedication.observations}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Inicio: {formatDateArgentina(currentMedication.startDate)}</span>
                      </div>

                      {currentMedication.doctor && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>Dr. {currentMedication.doctor.firstName} {currentMedication.doctor.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>
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
                  className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-gray-300"
                  onClick={() => handleMedicationClick(medication)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {medication.medicationName && (
                            <p className="text-sm font-semibold text-gray-700">
                              {medication.medicationName}
                            </p>
                          )}
                          {medication.observations && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {medication.observations}
                            </p>
                          )}
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Suspendida
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Inicio: {formatDateArgentina(medication.startDate)}</span>
                        </div>
                        {medication.suspensionDate && (
                          <div className="flex items-center gap-1 text-red-600">
                            <Calendar className="h-3 w-3" />
                            <span>Suspensión: {formatDateArgentina(medication.suspensionDate)}</span>
                          </div>
                        )}
                      </div>

                      {medication.suspensionReason && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Motivo:</span> {medication.suspensionReason}
                          </p>
                        </div>
                      )}

                      {medication.doctor && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>Dr. {medication.doctor.firstName} {medication.doctor.lastName}</span>
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
        {currentUserType === 'doctor' && (
          <CreateCurrentMedicationModal
            isOpen={isAddModalOpen}
            onClose={handleCloseModal}
            userData={userData}
            userType={userType}
            doctor={doctor}
          />
        )}

        {/* Modal para Editar Medicación */}
        {currentUserType === 'doctor' && currentMedication && (
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
          showActions={currentUserType === 'doctor'}
        />
      </div>
    </div>
  );
}