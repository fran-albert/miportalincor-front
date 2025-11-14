import useUserRole from "@/hooks/useRoles";
import { FileText, Activity, History, FileImage } from "lucide-react";
import { ModuleCard } from "@/components/shared/ModuleCard";
import { useNavigate } from "react-router-dom";

interface CollaboratorModulesProps {
  collaboratorSlug: string;
  totalExamenes?: number;
  totalEvoluciones?: number;
}

export default function CollaboratorModules({
  collaboratorSlug,
  totalExamenes,
  totalEvoluciones,
}: CollaboratorModulesProps) {
  const { isDoctor, isSecretary, isAdmin } = useUserRole();
  const navigate = useNavigate();

  const modules = [
    {
      title: "Exámenes Médicos",
      description: "Gestiona exámenes preocupacionales y periódicos",
      icon: FileText,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      onClick: () =>
        navigate(`/incor-laboral/colaboradores/${collaboratorSlug}/examenes`),
      visible: true,
      badge: totalExamenes,
    },
    {
      title: "Evoluciones",
      description: "Registro de evoluciones y seguimiento del colaborador",
      icon: Activity,
      gradient: "bg-gradient-to-br from-greenPrimary to-teal-600",
      onClick: () =>
        navigate(`/incor-laboral/colaboradores/${collaboratorSlug}/evoluciones`),
      visible: isDoctor || isSecretary,
      badge: totalEvoluciones,
    },
    {
      title: "Perfil",
      description: "Información completa y detallada del colaborador",
      icon: FileText,
      gradient: "bg-gradient-to-br from-teal-500 to-cyan-600",
      onClick: () =>
        navigate(`/incor-laboral/colaboradores/${collaboratorSlug}/perfil`),
      visible: true,
    },
  ];

  const visibleModules = modules.filter((module) => module.visible);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Módulos del Colaborador
        </h2>
        <p className="text-gray-600">
          Accede a la información y servicios del colaborador
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
            badge={module.badge}
          />
        ))}
      </div>
    </div>
  );
}
