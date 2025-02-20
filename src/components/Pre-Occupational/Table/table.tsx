import { getColumns } from "./columns";
import { Patient } from "@/types/Patient/Patient";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import BreadcrumbComponent from "@/components/Breadcrumb";

interface Props {
  Collaborators: Patient[];
  prefetchCollaborators: (id: number) => void;
  isFetching?: boolean;
  searchQuery: string;
  setSearch: (query: string) => void;
}

export const CollaboratorsTable: React.FC<Props> = ({
  Collaborators,
  isFetching,
  prefetchCollaborators,
  searchQuery,
  setSearch,
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();

  const columns = getColumns(prefetchCollaborators, {
    isSecretary,
    isDoctor,
    isAdmin,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
  ];

  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <h2 className="text-2xl font-bold text-greenPrimary mb-6">
        Lista de Colaboradores
      </h2>
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={Collaborators}
          searchPlaceholder="Buscar colaborador..."
          showSearch={true}
          searchQuery={searchQuery}
          onSearchSubmit={setSearch} 
          addLinkPath="/incor-laboral/colaboradores/agregar"
          querySearchFilter=" colaboradores"
          addLinkText="Agregar Colaborador"
          isFetching={isFetching}
          canAddUser={isSecretary || isAdmin}
        />
      </div>
    </div>
  );
};
