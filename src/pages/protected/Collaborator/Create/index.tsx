import { PageHeader } from "@/components/PageHeader";
import { CreateCollaboratorComponent } from "@/components/Collaborators/Create";
import { UserPlus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const breadcrumbItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Incor Laboral", href: "/incor-laboral" },
  {
    label: "Agregar Colaborador",
    href: "/incor-laboral/colaboradores/agregar",
  },
];

const CreateCollaboratorPage = () => {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId');

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Agregar Colaborador"
        description="Completa los campos para registrar un nuevo colaborador en el sistema"
        icon={<UserPlus className="h-6 w-6" />}
      />
      <CreateCollaboratorComponent preselectedCompanyId={companyId} />
    </div>
  );
};

export default CreateCollaboratorPage;
