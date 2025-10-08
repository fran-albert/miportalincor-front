import { getColumns } from "./columns";
import { Patient } from "@/types/Patient/Patient";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import BreadcrumbComponent from "@/components/Breadcrumb";

interface PatientTableProps {
  patients: Patient[];
  prefetchPatients: (id: number) => void;
  isFetching?: boolean;
  searchQuery: string;
  setSearch: (query: string) => void;
}

export const PatientsTable: React.FC<PatientTableProps> = ({
  patients,
  isFetching,
  prefetchPatients,
  searchQuery,
  setSearch,
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();

  const patientColumns = getColumns(prefetchPatients, {
    isSecretary,
    isDoctor,
    isAdmin,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
  ];

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <h2 className="text-2xl font-bold text-greenPrimary mb-6">
        Lista de Pacientes
      </h2>
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={patientColumns}
          data={patients}
          searchPlaceholder="Buscar pacientes..."
          showSearch={true}
          searchQuery={searchQuery}
          onSearchSubmit={setSearch}
          addLinkPath="/pacientes/agregar"
          addLinkText="Agregar Paciente"
          isFetching={isFetching}
          canAddUser={isSecretary || isAdmin}
        />
      </div>
    </div>
  );
};
