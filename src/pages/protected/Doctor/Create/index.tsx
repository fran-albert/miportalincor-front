import { PageHeader } from "@/components/PageHeader";
import CreateDoctorComponent from "@/components/Doctors/Create/CreateDoctorForm";
import { UserPlus } from "lucide-react";

const breadcrumbItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Médicos", href: "/medicos" },
  { label: "Agregar Médico", href: "/medicos/agregar" },
];

const CreateDoctorPage = () => {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Agregar Médico"
        description="Completa los campos para registrar un nuevo médico en el sistema"
        icon={<UserPlus className="h-6 w-6" />}
      />
      <CreateDoctorComponent />
    </div>
  );
};

export default CreateDoctorPage;
