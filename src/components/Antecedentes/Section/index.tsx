import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Plus } from "lucide-react";
import {
  Antecedente,
  AntecedentesResponse,
} from "@/types/Antecedentes/Antecedentes";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import useUserRole from "@/hooks/useRoles";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { CreateAntecedenteDialog } from "../Create";
import { formatDate } from "@/common/helpers/helpers";
import { ViewAntecedenteDialog } from "../View";

type UserData = Patient | Doctor;

interface Props {
  userData: UserData;
  userType?: 'patient' | 'doctor';
  antecedentes: AntecedentesResponse | undefined;
  readOnly?: boolean;
  showEditActions?: boolean;
  // Mantener compatibilidad con el prop anterior
  patient?: Patient;
}

const AntecedentesSection: React.FC<Props> = ({ 
  userData,
  userType = 'patient',
  antecedentes, 
  readOnly = false, 
  showEditActions = true,
  patient // Para compatibilidad hacia atrás
}) => {
  // Usar userData si está disponible, si no usar patient para compatibilidad
  const currentUser = userData || patient;
  if (!currentUser) return null;
  const navigate = useNavigate();
  const { session } = useUserRole();
  const handleNavigateToAntecedentes = () => {
    const basePath = userType === 'doctor' ? 'medicos' : 'pacientes';
    navigate(`/${basePath}/${currentUser.slug}/historia-clinica/antecedentes`);
  };
  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: antecedentesData, isLoading: isLoadingAntecedentes } =
    useDataTypes({
      auth: true,
      fetch: wantsToOpenModal, // Only fetch when user wants to open modal
      categories: ["ANTECEDENTES"],
      apiType: "incor",
    });

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!session?.id, // Only fetch when user wants to open modal and we have session
    id: parseInt(session?.id || "0"),
  });

  const isDataReady =
    !isLoadingAntecedentes && !isLoadingDoctor && antecedentesData && doctor;

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

  const [selectedAntecedenteToView, setSelectedAntecedenteToView] =
    useState<Antecedente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const handleAntecedenteClick = (antecedente: Antecedente) => {
    setSelectedAntecedenteToView(antecedente);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setWantsToOpenModal(false);
  };

  const renderAntecedentesPorCategoria = () => {
    if (!antecedentes?.antecedentes) return null;

    const antecedentesPorCategoria = antecedentes.antecedentes.reduce(
      (acc, ant) => {
        if (!acc[ant.dataType.name]) {
          acc[ant.dataType.name] = [];
        }
        acc[ant.dataType.name].push(ant);
        return acc;
      },
      {} as Record<string, Antecedente[]>
    );

    return Object.entries(antecedentesPorCategoria).map(
      ([categoria, antecedentesCategoria]) => (
        <div key={categoria} className="space-y-2">
          <div className="font-bold text-sm text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-1">
            {categoria}
          </div>
          <div className="space-y-1 ml-2">
            {antecedentesCategoria.map((ant) => (
              <div
                key={ant.id}
                className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                onClick={() => handleAntecedenteClick(ant)}
              >
                <span className="text-xs text-gray-500 font-mono">
                  {formatDate(ant.createdAt)}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {ant.observaciones}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    );
  };

  return (
    <div>
      <Card className="lg:col-span-1">
        <CardHeader className="pb-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-xl font-bold text-gray-800 flex items-center gap-2 cursor-pointer hover:text-teal-600 transition-colors"
              onClick={handleNavigateToAntecedentes}
            >
              <Stethoscope className="h-5 w-5 text-teal-600" />
              ANTECEDENTES MÉDICOS
            </CardTitle>
            {showEditActions && !readOnly && (
              <Button
                size="sm"
                className="bg-greenPrimary hover:bg-teal-700 text-white w-8 h-8 rounded-full p-0 shadow-sm"
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
            {antecedentes?.antecedentes.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  No hay antecedentes registrados
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Haz clic en "+" para agregar el primer antecedente
                </p>
              </div>
            ) : (
              renderAntecedentesPorCategoria()
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Crear Antecedente - Solo si se permite edición */}
      {showEditActions && !readOnly && (
        <CreateAntecedenteDialog
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          idUser={String(currentUser.userId)}
          idDoctor={String(session?.id)}
          onSuccess={() => {
            // Refresh the antecedentes list here if needed
            console.log("Antecedente created successfully");
            handleCloseModal();
          }}
        />
      )}

      <ViewAntecedenteDialog
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        antecedente={selectedAntecedenteToView}
      />
    </div>
  );
};

export default AntecedentesSection;
