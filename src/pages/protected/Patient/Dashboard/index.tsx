import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";
import { Patient } from "@/types/Patient/Patient";
import PatientModules from "@/components/Patients/Modules";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard({ patient }: { patient: Patient }) {
  const navigate = useNavigate();
  const handleHistoriaClinicaClick = () => {
    navigate(`/pacientes/${patient.slug}/historia-clinica`);
  };

  const handleEstudiosClick = () => {
    navigate(`/pacientes/${patient.slug}/estudios`);
  };

  const handleControlNutricionalClick = () => {
    navigate(`/pacientes/${patient.slug}/control-nutricional`);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header del Paciente */}
        <PatientInformation patient={patient} />
        <PatientModules
          onHistoriaClinicaClick={handleHistoriaClinicaClick}
          onEstudiosClick={handleEstudiosClick}
          onControlNutricionalClick={handleControlNutricionalClick}
        />
      </div>
    </div>
  );
}
