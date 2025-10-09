import { PageHeader } from "@/components/PageHeader";
import { CreatePatientComponent } from "@/components/Patients/Create";
import { UserPlus } from "lucide-react";

const breadcrumbItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Pacientes", href: "/pacientes" },
  { label: "Agregar Paciente", href: "/pacientes/agregar" },
];

const CreatePatientPage = () => {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Agregar Paciente"
        description="Completa los campos para registrar un nuevo paciente en el sistema"
        icon={<UserPlus className="h-6 w-6" />}
      />
      <CreatePatientComponent />
    </div>
  );
};

export default CreatePatientPage;
