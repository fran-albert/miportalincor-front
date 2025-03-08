import { parseSlug } from "@/common/helpers/helpers";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { EditCollaboratorComponent } from "@/components/Collaborators/Edit";
import LoadingAnimation from "@/components/Loading/loading";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import { useParams } from "react-router-dom";

const CollaboratorEditPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { id } = parseSlug(slug);

  const { collaborator, isLoading, error } = useCollaborator({
    auth: true,
    id,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
    {
      label: collaborator
        ? `${collaborator.firstName} ${collaborator.lastName}`
        : "Colaboradores",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}`,
    },
    {
      label: collaborator ? `Editar` : "Colaboradores",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}`,
    },
  ];

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <div className="">
        {collaborator && (
          <EditCollaboratorComponent collaborator={collaborator} />
        )}
      </div>
    </div>
  );
};

export default CollaboratorEditPage;
