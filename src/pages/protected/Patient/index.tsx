import { usePatient } from "@/hooks/Patient/usePatient";
import { PatientComponent } from "@/components/Patients/Component";
import { useParams } from "react-router-dom";
import LoadingAnimation from "@/components/Loading/loading";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";

const PatientPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { isLoading, patient, error } = usePatient({
    auth: true,
    id,
  });

  const {
    data: studies,
    error: errorStudies,
    isError,
    isLoading: isLoadingStudies,
  } = useGetStudyWithUrlByUserId({
    userId: id,
    auth: true,
  });

  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? "Pacientes"
            : `${patient?.firstName} ${patient?.lastName}`}
        </title>
        <meta
          name="description"
          content={`Información detallada sobre el patient ${patient?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`patient, ${patient?.firstName}, perfil`}
        />
      </Helmet>
      {error && <div>Hubo un error al cargar los pacientes.</div>}
      {isLoading || isLoadingStudies ? (
        <LoadingAnimation />
      ) : (
        <PatientComponent patient={patient} studies={studies} />
      )}
    </>
  );
};

export default PatientPage;
