import { getColumns } from "./columns";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { UserCog } from "lucide-react";

interface Props {
  Collaborators: Collaborator[];
  isFetching?: boolean;
}

export const CollaboratorsTable: React.FC<Props> = ({
  Collaborators,
  isFetching,
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();

  const columns = getColumns({
    isSecretary,
    isDoctor,
    isAdmin,
  });

  // Sort collaborators by company name (A-Z) then by collaborator name (A-Z)
  const sortedCollaborators = [...Collaborators].sort((a, b) => {
    // First sort by company name
    const companyA = a.company?.name?.toLowerCase() || '';
    const companyB = b.company?.name?.toLowerCase() || '';
    
    if (companyA !== companyB) {
      return companyA.localeCompare(companyB);
    }
    
    // If companies are the same, sort by collaborator full name
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    
    return nameA.localeCompare(nameB);
  });

  const customFilterFunction = (collaborator: Collaborator, query: string) => {
    const fullName = `${collaborator.firstName.toLowerCase()} ${collaborator.lastName.toLowerCase()}`;
    const reversedFullName = `${collaborator.lastName.toLowerCase()} ${collaborator.firstName.toLowerCase()}`;
    return (
      fullName.includes(query.toLowerCase()) ||
      reversedFullName.includes(query.toLowerCase()) ||
      collaborator.userName.toLowerCase().includes(query.toLowerCase())
    );
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Lista de Colaboradores"
        description="Gestiona colaboradores y exámenes preocupacionales"
        icon={<UserCog className="h-6 w-6" />}
        badge={sortedCollaborators.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={sortedCollaborators}
          searchPlaceholder="Buscar colaborador..."
          showSearch={true}
          customFilter={customFilterFunction}
          addLinkPath="/incor-laboral/colaboradores/agregar"
          searchQueryFilterTable={"colaborador"}
          querySearchFilter=" colaboradores"
          addLinkText="Agregar Colaborador"
          isFetching={isFetching}
          canAddUser={isSecretary || isAdmin}
        />
      </div>
    </div>
  );
};
