import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Calendar, FileText } from "lucide-react";
import { MedicacionActualResponse } from "@/types/Antecedentes/Antecedentes";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import useUserRole from "@/hooks/useRoles";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import CreateCurrentMedicationModal from "../Create";
import EditCurrentMedicationModal from "../Edit";
import ViewMedicacionActualModal from "../View-Simple";
import { formatDateArgentina } from "@/common/helpers/helpers";
import { MedicationStatus, CurrentMedication } from "@/types/Current-Medication/Current-Medication";

type UserData = Patient | Doctor;

interface CurrentMedicationSectionProps {
  userData: UserData;
  userType?: "patient" | "doctor";
  medicacionActual: MedicacionActualResponse | undefined;
  readOnly?: boolean;
  showEditActions?: boolean;
}

const CurrentMedicationSection: React.FC<CurrentMedicationSectionProps> = ({
  userData,
  userType = "patient",
  medicacionActual,
  readOnly = false,
  showEditActions = true,
}) => {
  // Todos los Hooks deben ir ANTES de cualquier return condicional
  const navigate = useNavigate();
  const { session } = useUserRole();
  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicationToView, setSelectedMedicationToView] = useState<CurrentMedication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!session?.id,
    id: session?.id || "0",
  });

  // Obtener solo la medicación activa más reciente
  const currentMedication = medicacionActual && medicacionActual.length > 0
    ? medicacionActual.find(m => m.status === MedicationStatus.ACTIVE) || medicacionActual[0]
    : null;

  const isDataReady = !isLoadingDoctor && doctor;

  // Effect to open modal when data is ready
  useEffect(() => {
    if (wantsToOpenModal && isDataReady) {
      // Si hay medicación actual, abrir modal de edición, sino de creación
      if (currentMedication) {
        setIsEditModalOpen(true);
      } else {
        setIsAddModalOpen(true);
      }
      setWantsToOpenModal(false);
    }
  }, [wantsToOpenModal, isDataReady, currentMedication]);

  // Ahora el early return después de todos los Hooks
  if (!userData) return null;

  // Determinar el tipo de usuario basado en la sesión, no en la página
  const currentUserType = (Array.isArray(session?.role) && session.role.includes('Medico')) ? 'doctor' : 'patient';

  // Debug temporal
  console.log('🔍 Debug session:', {
    session,
    sessionRole: session?.role,
    currentUserType,
    originalUserType: userType
  });

  const handleNavigateToMedicacionActual = () => {
    const basePath = userType === 'doctor' ? 'medicos' : 'pacientes';
    navigate(`/${basePath}/${userData.slug}/historia-clinica/medicacion-actual`);
  };

  const handleOpenModal = () => {
    setWantsToOpenModal(true);
  };

  const handleMedicationClick = (medication: CurrentMedication) => {
    setSelectedMedicationToView(medication);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setWantsToOpenModal(false);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMedicationToView(null);
  };

  const renderMedicacion = () => {
    if (!currentMedication) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Pill className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin medicación registrada
          </h3>
          <p className="text-sm text-gray-500">
            {showEditActions && !readOnly
              ? 'Haz clic en "Agregar" para registrar la medicación actual'
              : 'No hay medicación registrada para este usuario'}
          </p>
        </div>
      );
    }

    return (
      <div
        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-greenPrimary/50 transition-all duration-200 bg-white border-l-4 border-l-greenPrimary"
        onClick={() => handleMedicationClick(currentMedication)}
      >
        <div className="space-y-2">
          {currentMedication.medicationName && (
            <p className="text-base font-bold text-gray-900">
              {currentMedication.medicationName}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {currentMedication.dosage && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-700">Dosis:</span>
                <span>{currentMedication.dosage}</span>
              </div>
            )}
            {currentMedication.frequency && (
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-700">Frecuencia:</span>
                <span>{currentMedication.frequency}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-greenPrimary" />
            <span className="font-medium">Desde: {formatDateArgentina(currentMedication.startDate)}</span>
          </div>

          {currentMedication.observations && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-start gap-1 text-xs text-gray-700">
                <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                <span className="leading-relaxed whitespace-pre-line">{currentMedication.observations}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Card className="lg:col-span-1 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              <CardTitle
                className="cursor-pointer hover:opacity-80 transition-opacity underline decoration-white/40 decoration-2 underline-offset-4"
                onClick={handleNavigateToMedicacionActual}
              >
                Medicación Actual
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {currentMedication && (
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  1 registro
                </span>
              )}
              {showEditActions && !readOnly && (
                <Button
                  size="sm"
                  className="bg-white text-greenPrimary hover:bg-white/90 px-3 h-8 shadow-md"
                  onClick={handleOpenModal}
                  disabled={wantsToOpenModal}
                >
                  {wantsToOpenModal ? (
                    <div className="w-4 h-4 border-2 border-greenPrimary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">
                      {currentMedication ? 'Actualizar' : 'Agregar'}
                    </span>
                  )}
                </Button>
              )}
              {readOnly && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">
                  Solo lectura
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {renderMedicacion()}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Crear Medicación - Solo si se permite edición */}
      {showEditActions && !readOnly && (
        <CreateCurrentMedicationModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          userData={userData}
          userType={userType}
          doctor={doctor}
        />
      )}

      {/* Dialog para Editar Medicación - Solo si se permite edición */}
      {showEditActions && !readOnly && currentMedication && (
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
        showActions={showEditActions && !readOnly}
      />

    </div>
  );
};

export default CurrentMedicationSection;