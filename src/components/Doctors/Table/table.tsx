import { getColumns } from "./columns";
import { Doctor } from "@/types/Doctor/Doctor";
import { DataTable } from "@/components/Table/table";
import useRoles from "@/hooks/useRoles";
import BreadcrumbComponent from "@/components/Breadcrumb";

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
    { label: "Médicos", href: "/medicos" },
  ];

  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <h2 className="text-2xl font-bold text-greenPrimary mb-6">
        Lista de Médicos
      </h2>
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
