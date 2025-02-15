import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams } from "react-router-dom";
import LoadingAnimation from "@/components/Loading/loading";
import { Helmet } from "react-helmet-async";
import { PreOcuppationalComponent } from "@/components/Pre-Occupational/Component";

const CollaboratorPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { isLoading, patient, error } = usePatient({
    auth: true,
    id,
  });

  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? "Colaboradores"
            : `${patient?.firstName} ${patient?.lastName}`}
        </title>
        <meta
          name="description"
          content={`Información detallada sobre el colaborador ${patient?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`Collaborator, ${patient?.firstName}, perfil`}
        />
      </Helmet>
      {error && <div>Hubo un error al cargar el colaborador.</div>}
      {isLoading ? (
        <LoadingAnimation />
      ) : patient ? (
        <PreOcuppationalComponent Collaborator={patient} />
      ) : (
        <div>No hay un colaborador disponible.</div>
      )}
    </>
  );
};

export default CollaboratorPage;
