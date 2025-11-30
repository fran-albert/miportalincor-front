import UserInformation from "@/components/Usuario/Informacion";
import { Doctor } from "@/types/Doctor/Doctor";
import DoctorModules from "@/components/Doctors/Modules";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard({ doctor }: { doctor: Doctor }) {
  const navigate = useNavigate();
  
  const handleHistoriaClinicaClick = () => {
    navigate(`/medicos/${doctor.slug}/historia-clinica`);
  };

  const handleEstudiosClick = () => {
    navigate(`/medicos/${doctor.slug}/estudios`);
  };

  const handleControlNutricionalClick = () => {
    navigate(`/medicos/${doctor.slug}/control-nutricional`);
  };

  const handlePacientesClick = () => {
    navigate(`/pacientes`);
  };

  const handleEspecialidadesClick = () => {
    navigate(`/especialidades`);
  };

  return (
    <div className="space-y-6">
      {/* Header del Médico */}
      <UserInformation userData={doctor} userType="doctor" />

      {/* Módulos de Acceso */}
      <DoctorModules
        onHistoriaClinicaClick={handleHistoriaClinicaClick}
        onEstudiosClick={handleEstudiosClick}
        onControlNutricionalClick={handleControlNutricionalClick}
        onPacientesClick={handlePacientesClick}
        onEspecialidadesClick={handleEspecialidadesClick}
      />
    </div>
  );
}