import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { parseSlug } from "@/common/helpers/helpers";
import { useCollaborator } from "@/hooks/Collaborator/useCollaborator";
import LoadingAnimation from "@/components/Loading/loading";
import { CollaboratorDashboardComponent } from "@/components/Collaborators/Dashboard/Component";

// const medicationsData = [
//   {
//     id: 1,
//     name: "Ibuprofeno",
//     dose: "400mg",
//     frequency: "Cada 8 horas",
//     startDate: "2024-02-28",
//     status: "Activo",
//     indication: "Dolor lumbar",
//   },
//   {
//     id: 2,
//     name: "Vitamina D",
//     dose: "1000 UI",
//     frequency: "Diario",
//     startDate: "2024-01-15",
//     status: "Activo",
//     indication: "Suplementación",
//   },
//   {
//     id: 3,
//     name: "Omeprazol",
//     dose: "20mg",
//     frequency: "En ayunas",
//     startDate: "2024-01-10",
//     status: "Suspendido",
//     indication: "Gastritis",
//   },
// ];
const CollaboratorPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { id } = parseSlug(slug);
  const { collaborator, isLoading } = useCollaborator({
    auth: true,
    id,
  });

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <>
      <Helmet>
        <title>Colaborador - Incor Laboral</title>
      </Helmet>
      <CollaboratorDashboardComponent
        collaborator={collaborator}
        isLoadingCollaborator={isLoading}
      />
    </>
  );
};

export default CollaboratorPage;
