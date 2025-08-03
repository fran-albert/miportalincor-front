import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/Patient/Patient";
import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";
import { CreateAntecedenteDialog } from "@/components/Antecedentes/Create";
import { ViewAntecedenteDialog } from "@/components/Antecedentes/View";
import useUserRole from "@/hooks/useRoles";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import {
  AntecedentesResponse,
  Antecedente,
} from "@/types/Antecedentes/Antecedentes";
import { formatDate } from "@/common/helpers/helpers";

interface PatientHistoryProps {
  onBack?: () => void;
  patient: Patient;
  antecedentes: AntecedentesResponse | undefined;
}

export default function PatientHistory({
  patient,
  antecedentes,
}: PatientHistoryProps) {
  const navigate = useNavigate();
  const { session } = useUserRole();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);

  // Pre-load data needed for the modal
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

  // Check if all data is loaded
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

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setWantsToOpenModal(false);
  };

  const handleNavigateToAntecedentes = () => {
    navigate(`/pacientes/${patient.slug}/historia-clinica/antecedentes`);
  };

  const [selectedAntecedenteToView, setSelectedAntecedenteToView] =
    useState<Antecedente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleAntecedenteClick = (antecedente: Antecedente) => {
    setSelectedAntecedenteToView(antecedente);
    setIsViewModalOpen(true);
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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PatientInformation patient={patient} />
        {/* Sección de Antecedentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Dialog para Crear Antecedente */}
          <CreateAntecedenteDialog
            isOpen={isAddModalOpen}
            onClose={handleCloseModal}
            idUser={String(patient.userId)}
            idDoctor={String(session?.id)}
            onSuccess={() => {
              // Refresh the antecedentes list here if needed
              console.log("Antecedente created successfully");
              handleCloseModal();
            }}
          />

          {/* Modal para Ver Antecedente Completo */}
          <ViewAntecedenteDialog
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            antecedente={selectedAntecedenteToView}
          />
          {/* Evoluciones - Columna derecha */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl bg-green-200 px-4 py-2 rounded">
                EVOLUCIONES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                Área para evoluciones del paciente
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medicación Actual - Abajo a la izquierda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">MEDICACIÓN ACTUAL</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                Lista de medicamentos actuales
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            {/* Espacio vacío para mantener el layout */}
          </div>
        </div>
      </div>
    </div>
  );
}
