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
import { ViewAntecedenteDialog } from "../View";
import { canDeleteEvolution, getDeleteTimeRemaining } from "@/common/helpers/evolutionHelpers";

type UserData = Patient | Doctor;

interface Props {
  userData: UserData;
  userType?: "patient" | "doctor";
  antecedentes: AntecedentesResponse | undefined;
  readOnly?: boolean;
  showEditActions?: boolean;
  patient?: Patient;
}

const AntecedentesSection: React.FC<Props> = ({
  userData,
  userType = "patient",
  antecedentes,
  readOnly = false,
  showEditActions = true,
  patient, // Para compatibilidad hacia atrás
}) => {
  // Usar userData si está disponible, si no usar patient para compatibilidad
  const currentUser = userData || patient;

  // All hooks must be called before any conditional returns
  const navigate = useNavigate();
  const { session } = useUserRole();
  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAntecedenteToView, setSelectedAntecedenteToView] =
    useState<Antecedente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: antecedentesData, isLoading: isLoadingAntecedentes } =
    useDataTypes({
      auth: true,
      fetch: wantsToOpenModal, // Only fetch when user wants to open modal
      categories: ["ANTECEDENTES"],
      apiType: "incor",
    });

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!session?.id, // Only fetch when user wants to open modal and we have session
    id: session?.id || "0",
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

  // Early return after all hooks have been called
  if (!currentUser) return null;

  const handleNavigateToAntecedentes = () => {
    const basePath = userType === 'doctor' ? 'medicos' : 'pacientes';
    navigate(`/${basePath}/${currentUser.slug}/historia-clinica/antecedentes`);
  };

  const handleOpenModal = () => {
    setWantsToOpenModal(true);
  };
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
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-greenPrimary/30"></div>
            <h4 className="text-xs font-bold text-greenPrimary uppercase tracking-wider px-2">
              {categoria}
            </h4>
            <div className="h-px flex-1 bg-greenPrimary/30"></div>
          </div>
          <div className="space-y-2">
            {antecedentesCategoria.map((ant) => (
              <div
                key={ant.id}
                className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-greenPrimary/50 transition-all duration-200 bg-white border-l-4 border-l-greenPrimary"
                onClick={() => handleAntecedenteClick(ant)}
              >
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  {ant.observaciones}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    );
  };

  return (
    <div>
      <Card className="lg:col-span-1 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              <CardTitle
                className="cursor-pointer hover:opacity-80 transition-opacity underline decoration-white/40 decoration-2 underline-offset-4"
                onClick={handleNavigateToAntecedentes}
              >
                Antecedentes Médicos
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {antecedentes && antecedentes.antecedentes.length > 0 && (
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  {antecedentes.antecedentes.length} registro
                  {antecedentes.antecedentes.length !== 1 ? "s" : ""}
                </span>
              )}
              {showEditActions && !readOnly && (
                <Button
                  size="sm"
                  className="bg-white text-greenPrimary hover:bg-white/90 w-8 h-8 rounded-full p-0 shadow-md"
                  onClick={handleOpenModal}
                  disabled={wantsToOpenModal}
                >
                  {wantsToOpenModal ? (
                    <div className="w-4 h-4 border-2 border-greenPrimary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
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
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {!antecedentes || antecedentes.antecedentes.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin antecedentes registrados
                </h3>
                <p className="text-sm text-gray-500">
                  {showEditActions && !readOnly
                    ? 'Haz clic en el botón "+" para agregar el primer antecedente'
                    : "No hay antecedentes médicos para este usuario"}
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
        canDelete={
          selectedAntecedenteToView
            ? canDeleteEvolution(selectedAntecedenteToView.createdAt)
            : false
        }
        canEdit={
          selectedAntecedenteToView && session?.id
            ? selectedAntecedenteToView.doctor?.userId === Number(session.id)
            : false
        }
        timeRemaining={
          selectedAntecedenteToView
            ? getDeleteTimeRemaining(selectedAntecedenteToView.createdAt)
            : ""
        }
      />
    </div>
  );
};

export default AntecedentesSection;
