import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import BreadcrumbComponent from "@/components/Breadcrumb";
import {
  AntecedentesResponse,
  EvolucionesResponse,
  MedicacionActualResponse,
} from "@/types/Antecedentes/Antecedentes";
import GenericHistory from "@/components/Historia-Clinica/Generic";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import { DoctorDashboardSkeleton } from "@/components/Skeleton/Doctor";

type UserData = Patient | Doctor;

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HistoryPageProps {
  userData: UserData | undefined;
  userType: "patient" | "doctor";
  antecedentes: AntecedentesResponse | undefined;
  evoluciones: EvolucionesResponse | undefined;
  medicacionActual: MedicacionActualResponse | undefined;
  isLoadingUser: boolean;
  isLoadingAntecedentes: boolean;
  isLoadingEvoluciones?: boolean;
  isLoadingMedicacionActual?: boolean;
  breadcrumbItems: BreadcrumbItem[];
  userError?: any;
  antecedentesError?: any;
  evolucionesError?: any;
  medicacionActualError?: any;
  patientId?: number; // ID del paciente extraído del slug
}

export function HistoryPage({
  userData,
  userType,
  antecedentes,
  evoluciones,
  medicacionActual,
  isLoadingUser,
  isLoadingAntecedentes,
  isLoadingEvoluciones = false,
  isLoadingMedicacionActual = false,
  breadcrumbItems,
  userError,
  antecedentesError,
  evolucionesError,
  medicacionActualError,
  patientId,
}: HistoryPageProps) {
  const isFirstLoadingUser = isLoadingUser && !userData;

  // Mostrar loading si el usuario está cargando (independientemente de antecedentes)
  if (isFirstLoadingUser) {
    return (
      <div className="space-y-4 p-6">
        {userType === "doctor" ? (
          <DoctorDashboardSkeleton />
        ) : (
          <PatientCardSkeleton />
        )}
      </div>
    );
  }

  // Solo mostrar "no encontrado" si no está cargando Y no hay datos
  if (!userData && !isLoadingUser) {
    return (
      <div className="space-y-4 p-6">
        <BreadcrumbComponent items={breadcrumbItems} />
        <div className="p-4 text-red-500">
          {userType === "patient"
            ? "Paciente no encontrado"
            : "Médico no encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <BreadcrumbComponent items={breadcrumbItems} />

      {userError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del{" "}
          {userType === "patient" ? "paciente" : "doctor"}.
        </div>
      )}
      {antecedentesError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los antecedentes.
        </div>
      )}
      {evolucionesError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar las evoluciones.
        </div>
      )}
      {medicacionActualError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar la medicación actual.
        </div>
      )}

      <div className="gap-6">
        <GenericHistory
          userData={userData}
          userType={userType}
          antecedentes={antecedentes}
          evoluciones={evoluciones}
          medicacionActual={medicacionActual}
          isLoadingAntecedentes={isLoadingAntecedentes}
          isLoadingEvoluciones={isLoadingEvoluciones}
          isLoadingMedicacionActual={isLoadingMedicacionActual}
          patientId={patientId}
        />
      </div>
    </div>
  );
}
