import { Collaborator } from "@/types/Collaborator/Collaborator";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";
import CollaboratorInformation from "../Collaborator-Information";
import { StatsCards } from "../StatsCards";
import CollaboratorModules from "@/components/Collaborators/Modules";
import { useCollaboratorStats } from "@/hooks/Collaborator/useCollaboratorStats";

interface CollaboratorDashboardComponentProps {
  collaborator: Collaborator | undefined;
  isLoadingCollaborator: boolean;
}

export function CollaboratorDashboardComponent({
  collaborator,
  isLoadingCollaborator,
}: CollaboratorDashboardComponentProps) {
  const collaboratorSlug = collaborator
    ? `${collaborator.firstName.toLowerCase()}-${collaborator.lastName.toLowerCase()}-${collaborator.id}`
    : "";

  const { stats, isLoading: isLoadingStats } = useCollaboratorStats({
    collaboratorId: collaborator?.id || 0,
    isAuthenticated: !!collaborator,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
    {
      label: collaborator
        ? `${collaborator.firstName.charAt(0).toUpperCase() + collaborator.firstName.slice(1).toLowerCase()} ${collaborator.lastName.charAt(0).toUpperCase() + collaborator.lastName.slice(1).toLowerCase()}`
        : "Colaborador",
    },
  ];

  if (isLoadingCollaborator) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={
          collaborator
            ? `${collaborator.firstName} ${collaborator.lastName}`
            : "Colaborador"
        }
        description="Información completa del colaborador y acceso a módulos"
        icon={<Briefcase className="h-6 w-6" />}
      />

      {collaborator && (
        <div className="space-y-6">
          {/* Información del Colaborador */}
          <CollaboratorInformation collaborator={collaborator} />

          {/* Estadísticas */}
          <StatsCards
            collaborator={collaborator}
            stats={stats}
            isLoading={isLoadingStats}
          />

          {/* Módulos */}
          <CollaboratorModules
            collaboratorSlug={collaboratorSlug}
            totalExamenes={stats.totalExamenes}
            totalEvoluciones={stats.totalEvoluciones}
          />
        </div>
      )}
    </div>
  );
}
