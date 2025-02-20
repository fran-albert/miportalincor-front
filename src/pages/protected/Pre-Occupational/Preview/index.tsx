import LoadingAnimation from "@/components/Loading/loading";
import PreOccupationalPreviewComponent from "@/components/Pre-Occupational/Preview";
import { usePatient } from "@/hooks/Patient/usePatient";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

export default function PreOccupationalPreviewPage() {
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
        <PreOccupationalPreviewComponent collaborator={patient}  />
      ) : (
        <div>No hay un colaborador disponible.</div>
      )}
    </>
  );
}
