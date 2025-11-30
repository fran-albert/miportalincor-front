import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { parseSlug } from "@/common/helpers/helpers";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import LoadingAnimation from "@/components/Loading/loading";
import { PageHeader } from "@/components/PageHeader";
import { Activity } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateCollaboratorEvolution from "@/components/Collaborators/Evolution/Create";
import CollaboratorListEvolution from "@/components/Collaborators/Evolution/List";
import { useEvolutions } from "@/hooks/Evolutions/useEvolutions";
import useRoles from "@/hooks/useRoles";

const CollaboratorEvolucionesPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { id, formattedName } = parseSlug(slug);
  const { collaborator, isLoading } = useCollaborator({
    auth: true,
    id,
  });

  const { isSecretary, isAdmin, session, isDoctor } = useRoles();
  const [evolutionView, setEvolutionView] = useState<"menu" | "list" | "new">(
    "menu"
  );

  const { evolutions } = useEvolutions({
    collaboratorId: id,
    enabled: !!id && (evolutionView === "list" || evolutionView === "new"),
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Colaboradores", href: "/incor-laboral/colaboradores" },
    {
      label: collaborator
        ? `${collaborator.firstName.charAt(0).toUpperCase() + collaborator.firstName.slice(1).toLowerCase()} ${collaborator.lastName.charAt(0).toUpperCase() + collaborator.lastName.slice(1).toLowerCase()}`
        : formattedName,
      href: `/incor-laboral/colaboradores/${slug}`,
    },
    { label: "Evoluciones" },
  ];

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <Helmet>
        <title>Evoluciones - {formattedName}</title>
      </Helmet>
      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title="Evoluciones"
          description={`Registro de evoluciones clínicas y seguimiento de ${formattedName}`}
          icon={<Activity className="h-6 w-6" />}
        />

        {evolutionView === "menu" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => setEvolutionView("list")}
                className="min-w-[200px] bg-greenPrimary text-white hover:bg-teal-600"
              >
                <Activity className="h-5 w-5 mr-2" />
                Ver Evoluciones
              </Button>
              {(isDoctor || isSecretary) && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setEvolutionView("new")}
                  className="min-w-[200px]"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nueva Evolución
                </Button>
              )}
            </div>
          </div>
        )}

        {evolutionView === "list" && (
          <CollaboratorListEvolution
            setEvolutionView={setEvolutionView}
            evolutions={evolutions || []}
          />
        )}

        {evolutionView === "new" && collaborator && (
          <CreateCollaboratorEvolution
            setEvolutionView={setEvolutionView}
            companyEmail={collaborator.company.email}
            doctorId={Number(session?.id)}
            collaboratorId={id}
            collaboratorName={`${collaborator.firstName} ${collaborator.lastName}`}
            userRole={{
              isSecretary,
              isAdmin,
              isDoctor,
            }}
          />
        )}
      </div>
    </>
  );
};

export default CollaboratorEvolucionesPage;
