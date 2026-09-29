import { getColumns } from "./columns";
import { Patient } from "@/types/Patient/Patient";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { UserPen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientTableProps {
  patients: Patient[];
  isFetching?: boolean;
  searchQuery: string;
  setSearch: (query: string) => void;
  currentPage?: number;
  totalPages?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  onlySelfSignupUnverified?: boolean;
  onToggleSelfSignupFilter?: () => void;
}

export const PatientsTable: React.FC<PatientTableProps> = ({
  patients,
  isFetching,
  searchQuery,
  setSearch,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onlySelfSignupUnverified = false,
  onToggleSelfSignupFilter,
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();

  const patientColumns = getColumns({
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
      {(isSecretary || isAdmin) && onToggleSelfSignupFilter && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-pressed={onlySelfSignupUnverified}
            onClick={onToggleSelfSignupFilter}
            data-testid="self-signup-filter"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border bg-white px-4 h-10 text-sm font-medium transition-colors",
              onlySelfSignupUnverified
                ? "border-greenPrimary text-greenPrimary"
                : "border-gray-300 text-gray-700 hover:border-gray-400"
            )}
          >
            <UserPen className="h-4 w-4" aria-hidden />
            Autoregistro sin verificar
          </button>
          {onlySelfSignupUnverified && (
            <span className="text-sm text-gray-500">
              Pacientes que se registraron solos y todavía no pasaron por
              recepción.
            </span>
          )}
        </div>
      )}
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={patientColumns}
          data={patients}
          searchPlaceholder="Buscar pacientes..."
          showSearch={true}
          searchQuery={searchQuery}
          setSearch={setSearch}
          useServerSideSearch={true}
          showDataOnEmptySearch={onlySelfSignupUnverified}
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
