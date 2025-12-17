import { PageHeader } from "@/components/PageHeader";
import CreateSecretaryComponent from "@/components/Secretaries/Create/CreateSecretaryForm";
import { UserPlus } from "lucide-react";

const breadcrumbItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Secretarias", href: "/secretarias" },
  { label: "Agregar Secretaria", href: "/secretarias/agregar" },
];

const CreateSecretaryPage = () => {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Agregar Secretaria"
        description="Completa los campos para registrar una nueva secretaria en el sistema"
        icon={<UserPlus className="h-6 w-6" />}
      />
      <CreateSecretaryComponent />
    </div>
  );
};

export default CreateSecretaryPage;
