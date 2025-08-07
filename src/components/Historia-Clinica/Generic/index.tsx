import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import UserInformation from "@/components/Usuario/Informacion";
import {
  AntecedentesResponse,
  EvolucionesResponse,
} from "@/types/Antecedentes/Antecedentes";
import AntecedentesSection from "@/components/Antecedentes/Section";
import EvolutionSection from "@/components/Evoluciones/Section";
import {
  AntecedentesSkeleton,
  EvolucionesSkeleton,
} from "@/components/Skeleton/Historia-Clinica";

type UserData = Patient | Doctor;

interface GenericHistoryProps {
  userData: UserData | undefined;
  userType: "patient" | "doctor";
  antecedentes: AntecedentesResponse | undefined;
  evoluciones: EvolucionesResponse | undefined;
  isLoadingAntecedentes?: boolean;
  isLoadingEvoluciones?: boolean;
  patientId?: number; // ID del paciente extraído del slug
  onBack?: () => void;
}

export default function GenericHistory({
  userData,
  userType,
  antecedentes,
  evoluciones,
  isLoadingAntecedentes = false,
  isLoadingEvoluciones = false,
  patientId,
}: GenericHistoryProps) {
  // Validación de seguridad - no debería llegar aquí sin userData, pero por si acaso
  if (!userData) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="p-4 text-red-500">
            Error: No hay datos de usuario disponibles
          </div>
        </div>
      </div>
    );
  }

  // Las evoluciones vienen como prop desde el backend

  // Título de la sección de medicación según el tipo de usuario
  const medicationTitle =
    userType === "doctor" ? "MEDICACIÓN PROFESIONAL" : "MEDICACIÓN ACTUAL";
  const medicationPlaceholder =
    userType === "doctor"
      ? "Medicación y suplementos del profesional médico"
      : "Lista de medicamentos actuales";

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Información del Usuario */}
        <UserInformation userData={userData} userType={userType} />

        {/* Sección de Antecedentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(isLoadingAntecedentes && !antecedentes) ||
          (isLoadingEvoluciones && !evoluciones) ? (
            <>
              <AntecedentesSkeleton />
              <EvolucionesSkeleton />
            </>
          ) : (
            <>
              <AntecedentesSection
                userData={userData}
                userType={userType}
                antecedentes={antecedentes}
                readOnly={false}
                showEditActions={true}
              />
              {/* Evoluciones - Columna derecha */}
              <EvolutionSection
                userData={userData}
                userType={userType}
                evoluciones={evoluciones}
                isLoadingEvoluciones={isLoadingEvoluciones}
                readOnly={false}
                showEditActions={true}
                allowNewEvolutions={true}
                patientId={patientId}
              />
            </>
          )}
        </div>

        {/* Medicación - Abajo a la izquierda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">{medicationTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                {medicationPlaceholder}
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
