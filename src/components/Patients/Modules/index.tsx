import useUserRole from "@/hooks/useRoles";
import { Stethoscope, Calendar, FileImage, ClipboardPlus, CalendarCheck } from "lucide-react";
import { ModuleCard } from "@/components/shared/ModuleCard";

interface PatientModulesProps {
  onHistoriaClinicaClick: () => void;
  onEstudiosClick: () => void;
  onControlNutricionalClick?: () => void;
  onCitasMedicasClick?: () => void;
  onChequeosPeriodicosClick?: () => void;
  totalStudies?: number;
}

export default function PatientModules({
  onHistoriaClinicaClick,
  onEstudiosClick,
  onControlNutricionalClick,
  onCitasMedicasClick,
  onChequeosPeriodicosClick,
  totalStudies,
}: PatientModulesProps) {
  const { isDoctor } = useUserRole();

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
      title: "Estudios e Imágenes",
      description: "Visualiza laboratorios, radiografías y otros estudios",
      icon: FileImage,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      onClick: onEstudiosClick,
      visible: true,
      badge: totalStudies,
    },
    {
      title: "Citas Médicas",
      description: "Programar y gestionar citas del paciente",
      icon: Calendar,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      onClick: onCitasMedicasClick || (() => {}),
      visible: true,
    },
    {
      title: "Chequeos Periódicos",
      description: "Controles médicos programados del paciente",
      icon: CalendarCheck,
      gradient: "bg-gradient-to-br from-rose-500 to-rose-600",
      onClick: onChequeosPeriodicosClick || (() => {}),
      visible: true,
    },
  ];

  const visibleModules = modules.filter((module) => module.visible);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Módulos del Paciente</h2>
        <p className="text-gray-600">Accede a la información y servicios del paciente</p>
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
            badge={module.badge}
            disabled={"disabled" in module && Boolean(module.disabled)}
            comingSoon={"comingSoon" in module && Boolean((module as { comingSoon?: boolean }).comingSoon)}
          />
        ))}
      </div>
    </div>
  );
}
