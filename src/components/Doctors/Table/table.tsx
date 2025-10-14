import { getColumns } from "./columns";
import { Doctor } from "@/types/Doctor/Doctor";
import { DataTable } from "@/components/Table/table";
import useRoles from "@/hooks/useRoles";
import { PageHeader } from "@/components/PageHeader";
import { Stethoscope } from "lucide-react";

interface DoctorsTableProps {
  doctors: Doctor[];
  prefetchDoctors: (id: number) => void;
  isLoading?: boolean;
}

export const DoctorsTable: React.FC<DoctorsTableProps> = ({
  doctors,
  isLoading,
  prefetchDoctors,
}) => {
  const customFilterFunction = (doctor: Doctor, query: string) => {
    const fullName = `${doctor.firstName.toLowerCase()} ${doctor.lastName.toLowerCase()}`;
    const reversedFullName = `${doctor.lastName.toLowerCase()} ${doctor.firstName.toLowerCase()}`; 
    return (
      fullName.includes(query.toLowerCase()) ||
      reversedFullName.includes(query.toLowerCase()) || 
      doctor.dni.toLowerCase().includes(query.toLowerCase()) 
    );
  };
  
  const { isSecretary, isDoctor, isAdmin } = useRoles();

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
        title="Lista de Médicos"
        description="Administra el equipo médico y sus especialidades"
        icon={<Stethoscope className="h-6 w-6" />}
        badge={doctors.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={doctorColumns}
          data={doctors}
          searchPlaceholder="Buscar médicos..."
          showSearch={true}
          customFilter={customFilterFunction}
          searchColumn="firstName"
          addLinkPath="/medicos/agregar"
          isLoading={isLoading}
          addLinkText="Agregar Médico"
          canAddUser={isSecretary}
        />
      </div>
    </div>
  );
};
