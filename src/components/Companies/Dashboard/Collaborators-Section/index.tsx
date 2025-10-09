import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { DataTable } from "@/components/Table/table";
import { getColumns } from "@/components/Collaborators/Table/columns";
import { Link } from "react-router-dom";
import useUserRole from "@/hooks/useRoles";

interface CollaboratorsSectionProps {
  collaborators: Collaborator[];
  isFetching: boolean;
  companyId: number;
}

export default function CollaboratorsSection({
  collaborators,
  isFetching,
}: CollaboratorsSectionProps) {
  const { isSecretary, isAdmin, isDoctor } = useUserRole();

  const columns = getColumns({
    isSecretary,
    isDoctor,
    isAdmin,
  });

  // Sort collaborators by name (A-Z)
  const sortedCollaborators = [...(collaborators || [])].sort((a, b) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Colaboradores de la Empresa</h2>
          <p className="text-gray-600">
            Gestiona y visualiza todos los colaboradores registrados ({sortedCollaborators.length})
          </p>
        </div>

        {(isSecretary || isAdmin) && (
          <Link to="/incor-laboral/colaboradores/agregar">
            <Button className="bg-greenPrimary hover:bg-teal-600 text-white shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Colaborador
            </Button>
          </Link>
        )}
      </div>

      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={sortedCollaborators}
          searchPlaceholder="Buscar colaborador..."
          showSearch={true}
          customFilter={customFilterFunction}
          searchQueryFilterTable={"colaborador"}
          querySearchFilter=" colaboradores"
          isFetching={isFetching}
          canAddUser={false}
        />
      </div>
    </div>
  );
}
