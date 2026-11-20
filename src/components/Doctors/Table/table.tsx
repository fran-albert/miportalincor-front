import { getColumns } from "./columns";
import { Doctor } from "@/types/Doctor/Doctor";
import { DataTable } from "@/components/Table/table";
import useRoles from "@/hooks/useRoles";
import { PageHeader } from "@/components/PageHeader";
import { Stethoscope } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import InactiveDoctorsList from "../Inactive/InactiveDoctorsList";

interface DoctorsTableProps {
  doctors: Doctor[];
  prefetchDoctors: (id: string) => void;
  isLoading?: boolean;
  searchQuery?: string;
  setSearch?: (search: string) => void;
  currentPage?: number;
  totalPages?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export const DoctorsTable: React.FC<DoctorsTableProps> = ({
  doctors,
  isLoading,
  prefetchDoctors,
  searchQuery = "",
  setSearch,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();
  const canManageDoctors = isSecretary || isAdmin;
  const [showInactive, setShowInactive] = useState(false);
  const isInactiveView = canManageDoctors && showInactive;

  const doctorColumns = getColumns(prefetchDoctors, {
    isSecretary,
    isAdmin,
    isDoctor,
  });
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={isInactiveView ? "Médicos desactivados" : "Lista de Médicos"}
        description={
          isInactiveView
            ? "No ingresan ni aparecen en agendas. Su historia clínica se sigue viendo."
            : "Administra el equipo médico y sus especialidades"
        }
        icon={<Stethoscope className="h-6 w-6" />}
        badge={isInactiveView ? undefined : doctors.length}
        actions={
          canManageDoctors ? (
            <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
              <Switch
                id="ver-desactivados"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="ver-desactivados" className="cursor-pointer text-sm">
                Ver desactivados
              </Label>
            </div>
          ) : undefined
        }
      />
      {isInactiveView ? (
        <InactiveDoctorsList />
      ) : (
        <div className="overflow-hidden sm:rounded-lg">
          <DataTable
            columns={doctorColumns}
            data={doctors}
            searchPlaceholder="Buscar médicos..."
            showSearch={true}
            searchQuery={searchQuery}
            setSearch={setSearch}
            useServerSideSearch={true}
            addLinkPath="/medicos/agregar"
            isLoading={isLoading}
            addLinkText="Agregar Médico"
            canAddUser={isSecretary || isAdmin}
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={onNextPage}
            onPrevPage={onPrevPage}
            clientPageSize={100}
            showDataOnEmptySearch={true}
          />
        </div>
      )}
    </div>
  );
};
