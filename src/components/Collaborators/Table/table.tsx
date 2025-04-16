import { getColumns } from "./columns";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { Collaborator } from "@/types/Collaborator/Collaborator";

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
  console.log(Collaborators);
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
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
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
