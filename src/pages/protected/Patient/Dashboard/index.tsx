import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";
import { Patient } from "@/types/Patient/Patient";
import PatientModules from "@/components/Patients/Modules";
import { StatsCards } from "@/components/Patients/Dashboard/StatsCards";
import { useNavigate } from "react-router-dom";
import { usePatientStats } from "@/hooks/Patient/usePatientStats";
import useUserRole from "@/hooks/useRoles";

export default function PatientDashboard({ patient }: { patient: Patient }) {
  const navigate = useNavigate();
  const { session } = useUserRole();

  const { stats, isLoading: isLoadingStats } = usePatientStats({
    userId: patient.userId,
    isAuthenticated: !!session,
  });

  const handleHistoriaClinicaClick = () => {
    navigate(`/pacientes/${patient.slug}/historia-clinica`);
  };

  const handleEstudiosClick = () => {
    navigate(`/pacientes/${patient.slug}/estudios`);
  };

  const handleControlNutricionalClick = () => {
    navigate(`/pacientes/${patient.slug}/control-nutricional`);
  };

  const handleCitasMedicasClick = () => {
    navigate(`/pacientes/${patient.slug}/turnos`);
  };

  return (
    <div className="space-y-6">
      {/* Header del Paciente */}
      <PatientInformation patient={patient} />

      {/* Estadísticas */}
      <StatsCards
        patientSlug={patient.slug || ''}
        stats={stats}
        isLoading={isLoadingStats}
      />

      {/* Módulos de Acceso */}
      <PatientModules
        onHistoriaClinicaClick={handleHistoriaClinicaClick}
        onEstudiosClick={handleEstudiosClick}
        onControlNutricionalClick={handleControlNutricionalClick}
        onCitasMedicasClick={handleCitasMedicasClick}
        totalStudies={stats.totalStudies}
      />
    </div>
  );
}
