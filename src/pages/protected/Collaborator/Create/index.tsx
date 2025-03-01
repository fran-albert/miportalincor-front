import BreadcrumbComponent from "@/components/Breadcrumb";
import { CreateCollaboratorComponent } from "@/components/Collaborators/Create";

const breadcrumbItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Incor Laboral", href: "/incor-laboral" },
  {
    label: "Agregar Colaborador",
    href: "/incor-laboral/colaboradores/agregar",
  },
];

const CreateCollaboratorPage = () => {
  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <CreateCollaboratorComponent />
    </div>
  );
};

export default CreateCollaboratorPage;
