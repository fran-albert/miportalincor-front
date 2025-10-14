import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import UserInformation from "@/components/Usuario/Informacion";
import {
  AntecedentesResponse,
  EvolucionesResponse,
  MedicacionActualResponse,
} from "@/types/Antecedentes/Antecedentes";
import AntecedentesSection from "@/components/Antecedentes/Section";
import EvolutionSection from "@/components/Evoluciones/Section";
import CurrentMedicationSection from "@/components/Current-Medication/Section";
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
  medicacionActual: MedicacionActualResponse | undefined;
  isLoadingAntecedentes?: boolean;
  isLoadingEvoluciones?: boolean;
  isLoadingMedicacionActual?: boolean;
  patientId?: number; // ID del paciente extraído del slug
  onBack?: () => void;
}

export default function GenericHistory({
  userData,
  userType,
  antecedentes,
  evoluciones,
  medicacionActual,
  isLoadingAntecedentes = false,
  isLoadingEvoluciones = false,
  isLoadingMedicacionActual = false,
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Información del Usuario */}
      <UserInformation userData={userData} userType={userType} />

        {/* Sección de Antecedentes y Evoluciones */}
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

        {/* Sección de Medicación Actual */}
        <div>
          {isLoadingMedicacionActual && !medicacionActual ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">
                Cargando medicaciones...
              </p>
            </div>
          ) : (
            <CurrentMedicationSection
              userData={userData}
              userType={userType}
              medicacionActual={medicacionActual}
              readOnly={false}
              showEditActions={true}
            />
          )}
        </div>
    </div>
  );
}
