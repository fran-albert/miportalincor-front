import { Company } from "@/types/Company/Company";
import CompanyInformation from "../Company-Information";
import { StatsCards } from "../StatsCards";
import CollaboratorsSection from "../Collaborators-Section";
import { useCollaboratorsByCompany } from "@/hooks/Collaborator/useCollaboratorsByCompany";
import useUserRole from "@/hooks/useRoles";
import { useMemo } from "react";

interface CompanyDashboardProps {
  company: Company;
}

export default function CompanyDashboard({ company }: CompanyDashboardProps) {
  const { session } = useUserRole();

  const { collaborators, isFetching } = useCollaboratorsByCompany({
    companyId: company.id,
    auth: !!session,
    fetch: true,
  });

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalCollaborators = collaborators.length;
    const activeCollaborators = collaborators.length; // Todos los colaboradores son activos por ahora
    const pendingExams = 0; // Placeholder - esto debería venir del backend
    const lastUpdate = collaborators.length > 0
      ? collaborators[0].createdAt || new Date()
      : null;

    return {
      totalCollaborators,
      activeCollaborators,
      pendingExams,
      lastUpdate,
    };
  }, [collaborators]);

  return (
    <div className="space-y-6">
      {/* Header de la Empresa */}
      <CompanyInformation
        company={company}
        totalCollaborators={stats.totalCollaborators}
      />

      {/* Estadísticas */}
      <StatsCards stats={stats} isLoading={isFetching} />

      {/* Tabla de Colaboradores */}
      <CollaboratorsSection
        collaborators={collaborators}
        isFetching={isFetching}
        companyId={company.id}
      />
    </div>
  );
}
