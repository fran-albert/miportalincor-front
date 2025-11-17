import useUserRole from "@/hooks/useRoles";
import {
  Stethoscope,
  Calendar,
  FileImage,
  ClipboardPlus,
  Users,
  Building2,
} from "lucide-react";
import { ModuleCard } from "@/components/shared/ModuleCard";

interface DoctorModulesProps {
  onHistoriaClinicaClick: () => void;
  onEstudiosClick?: () => void;
  onControlNutricionalClick?: () => void;
  onPacientesClick?: () => void;
  onEspecialidadesClick?: () => void;
}

export default function DoctorModules({
  onHistoriaClinicaClick,
  onEstudiosClick,
  onControlNutricionalClick,
  onPacientesClick,
  onEspecialidadesClick,
}: DoctorModulesProps) {
  const { isDoctor, isAdmin, isSecretary } = useUserRole();

  const modules = [
    {
      title: "Historia Clínica",
      description: "Accede al historial médico completo del paciente",
      icon: Stethoscope,
      gradient: "bg-gradient-to-br from-greenPrimary to-teal-600",
      onClick: onHistoriaClinicaClick,
      visible: isDoctor,
    },
    {
      title: "Control Nutricional",
      description: "Gestiona el plan nutricional y seguimiento del paciente",
      icon: ClipboardPlus,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      onClick: onControlNutricionalClick || (() => {}),
      visible: isDoctor,
    },
    {
      title: "Mis Pacientes",
      description: "Pacientes bajo mi cuidado médico",
      icon: Users,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      onClick: onPacientesClick || (() => {}),
      visible: isDoctor,
    },
    {
      title: "Agenda Médica",
      description: "Horarios y citas programadas",
      icon: Calendar,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      onClick: () => {},
      visible: isDoctor || isSecretary || isAdmin,
      disabled: true,
    },
    {
      title: "Estudios",
      description: "Imágenes y laboratorios del paciente",
      icon: FileImage,
      gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      onClick: onEstudiosClick || (() => {}),
      visible: (isDoctor || isSecretary || isAdmin) && !!onEstudiosClick,
    },
    {
      title: "Especialidades",
      description: "Gestión de especialidades médicas",
      icon: Building2,
      gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
      onClick: onEspecialidadesClick || (() => {}),
      visible: isDoctor || isAdmin,
    },
  ];

  const visibleModules = modules.filter((module) => module.visible);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Módulos del Médico</h2>
        <p className="text-gray-600">
          Accede a la información y servicios profesionales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleModules.map((module, index) => (
          <ModuleCard
            key={index}
            title={module.title}
            description={module.description}
            icon={module.icon}
            gradient={module.gradient}
            onClick={module.onClick}
            index={index}
            disabled={module.disabled}
          />
        ))}
      </div>
    </div>
  );
}
