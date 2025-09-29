import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Calendar, FileText } from "lucide-react";
import { MedicacionActualResponse } from "@/types/Antecedentes/Antecedentes";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import useUserRole from "@/hooks/useRoles";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import CreateCurrentMedicationModal from "../Create";
import ViewMedicacionActualModal from "../View-Simple";

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

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!session?.id,
    id: parseInt(session?.id || "0"),
  });

  const isDataReady = !isLoadingDoctor && doctor;

  // Effect to open modal when data is ready
  useEffect(() => {
    if (wantsToOpenModal && isDataReady) {
      setIsAddModalOpen(true);
      setWantsToOpenModal(false);
    }
  }, [wantsToOpenModal, isDataReady]);

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
    setWantsToOpenModal(false);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMedicationToView(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const renderMedicaciones = () => {
    if (!medicacionActual || medicacionActual.length === 0) {
      return (
        <div className="text-center py-8">
          <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No hay medicamentos registrados
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {showEditActions && !readOnly
              ? 'Haz clic en "+" para agregar el primer medicamento'
              : 'No se encontraron medicamentos registrados'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {medicacionActual.map((medication) => (
          <div
            key={medication.id}
            className="border-l-4 border-purple-500 pl-4 py-3 bg-white rounded-r-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleMedicationClick(medication)}
          >
            {/* Solo mostrar badge si está suspendido */}
            {medication.status === 'SUSPENDED' && (
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs bg-red-50 text-red-700 border border-red-200 rounded px-2 py-1">
                  Suspendido
                </span>
              </div>
            )}

            <div className="space-y-2">
              {medication.medicationName && (
                <p className="text-sm font-semibold text-gray-800">
                  {medication.medicationName}
                </p>
              )}

              {medication.dosage && (
                <p className="text-xs text-gray-600">
                  <strong>Dosis:</strong> {medication.dosage}
                </p>
              )}

              {medication.frequency && (
                <p className="text-xs text-gray-600">
                  <strong>Frecuencia:</strong> {medication.frequency}
                </p>
              )}

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Desde: {formatDate(medication.startDate)}</span>
              </div>

              {medication.observations && (
                <div className="flex items-start gap-1 text-xs text-gray-500">
                  <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{medication.observations}</span>
                </div>
              )}
            </div>
          </div>
        ))}
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
                className="bg-purple-600 hover:bg-purple-700 text-white w-8 h-8 rounded-full p-0 shadow-sm"
                onClick={handleOpenModal}
                disabled={wantsToOpenModal}
              >
                {wantsToOpenModal ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
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
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {renderMedicaciones()}
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