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
import { MedicationStatus } from "@/types/Current-Medication/Current-Medication";

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
  if (!userData) return null;

  const navigate = useNavigate();
  const { session } = useUserRole();

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

  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!session?.id,
    id: parseInt(session?.id || "0"),
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

  const handleOpenModal = () => {
    setWantsToOpenModal(true);
  };

  const [selectedMedicationToView, setSelectedMedicationToView] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleMedicationClick = (medication: any) => {
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
        <div className="text-center py-8">
          <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No hay medicación registrada
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {showEditActions && !readOnly
              ? 'Haz clic en "Actualizar" para registrar la medicación actual'
              : 'No se encontró medicación registrada'}
          </p>
        </div>
      );
    }

    return (
      <div
        className="border border-gray-100 border-l-4 border-l-purple-500 pl-4 py-3 bg-white rounded-r-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleMedicationClick(currentMedication)}
      >
        <div className="space-y-2">
          {currentMedication.medicationName && (
            <p className="text-sm font-semibold text-gray-800">
              {currentMedication.medicationName}
            </p>
          )}

          {currentMedication.dosage && (
            <p className="text-xs text-gray-600">
              <strong>Dosis:</strong> {currentMedication.dosage}
            </p>
          )}

          {currentMedication.frequency && (
            <p className="text-xs text-gray-600">
              <strong>Frecuencia:</strong> {currentMedication.frequency}
            </p>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Desde: {formatDateArgentina(currentMedication.startDate)}</span>
          </div>

          {currentMedication.observations && (
            <div className="flex items-start gap-1 text-xs text-gray-500">
              <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{currentMedication.observations}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Card className="lg:col-span-1">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-xl font-bold text-gray-800 flex items-center gap-2 cursor-pointer hover:text-purple-600 transition-colors"
              onClick={handleNavigateToMedicacionActual}
            >
              <Pill className="h-5 w-5 text-purple-600" />
              MEDICACIÓN ACTUAL
            </CardTitle>
            {showEditActions && !readOnly && (
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 h-8 shadow-sm"
                onClick={handleOpenModal}
                disabled={wantsToOpenModal}
              >
                {wantsToOpenModal ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-xs font-medium">
                    {currentMedication ? 'Actualizar' : 'Agregar'}
                  </span>
                )}
              </Button>
            )}
            {readOnly && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
                Solo lectura
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
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