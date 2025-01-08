import { getColumns } from "./columns";
import { Patient } from "@/types/Patient/Patient";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import BreadcrumbComponent from "@/components/Breadcrumb";
interface PatientTableProps {
  patients: Patient[];
  prefetchPatients: (id: number) => void;
  isLoading?: boolean;
}

export const PatientsTable: React.FC<PatientTableProps> = ({
  patients,
  isLoading,
  prefetchPatients,
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();

  const patientColumns = getColumns(prefetchPatients, {
    isSecretary,
    isDoctor,
    isAdmin,
  });
  const customFilterFunction = (patient: Patient, query: string) =>
    patient.firstName.toLowerCase().includes(query.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(query.toLowerCase()) ||
    patient.dni.toLowerCase().includes(query.toLowerCase());

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
  ];

  return (
    <div className=" space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <h2 className="text-2xl font-bold text-greenPrimary mb-6">
        Lista de Pacientes
      </h2>
      <div className="overflow-hidden sm:rounded-lg ">
        <DataTable
          columns={patientColumns}
          data={patients}
          searchPlaceholder="Buscar pacientes..."
          showSearch={true}
          addLinkPath="/pacientes/agregar"
          customFilter={customFilterFunction}
          addLinkText="Agregar Paciente"
          isLoading={isLoading}
          canAddUser={isSecretary || isAdmin}
        />
      </div>
    </div>
  );
};
