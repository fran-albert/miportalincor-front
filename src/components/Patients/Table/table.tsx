import { getColumns } from "./columns";
import { Patient } from "@/types/Patient/Patient";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Users } from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  prefetchPatients: (id: number) => void;
  isFetching?: boolean;
  searchQuery: string;
  setSearch: (query: string) => void;
  currentPage?: number;
  totalPages?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export const PatientsTable: React.FC<PatientTableProps> = ({
  patients,
  isFetching,
  prefetchPatients,
  searchQuery,
  setSearch,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();

  const patientColumns = getColumns(prefetchPatients, {
    isSecretary,
    isDoctor,
    isAdmin,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Lista de Pacientes"
        description="Gestiona la información y historias clínicas de los pacientes"
        icon={<Users className="h-6 w-6" />}
        badge={patients.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={patientColumns}
          data={patients}
          searchPlaceholder="Buscar pacientes..."
          showSearch={true}
          searchQuery={searchQuery}
          setSearch={setSearch}
          useServerSideSearch={true}
          addLinkPath="/pacientes/agregar"
          addLinkText="Agregar Paciente"
          isFetching={isFetching}
          canAddUser={isSecretary || isAdmin}
          currentPage={currentPage}
          totalPages={totalPages}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
        />
      </div>
    </div>
  );
};
