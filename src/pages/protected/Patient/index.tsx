import { usePatient } from "@/hooks/Patient/usePatient";
import { useStudy } from "@/hooks/Study/useStudy";
import { useStudyAndImageUrls } from "@/hooks/Study/useStudyAndImageUrls";
import { PatientComponent } from "@/components/Patients/Component";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  PatientCardSkeleton,
  StudiesCardSkeleton,
} from "@/components/Skeleton/Patient";

const PatientPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const {
    patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = usePatient({
    auth: true,
    id,
  });

  const {
    studiesByUserId = [],
    isLoading: isLoadingStudies,
    isRefetching: isRefetchingStudies,
  } = useStudy({
    idUser: id,
    fetchStudiesByUserId: true,
  });

  const {
    data: allUrls = {},
    isLoading: isLoadingUrls,
    isRefetching: isRefetchingUrls,
  } = useStudyAndImageUrls(id, studiesByUserId);

  const isFirstLoadingPatient = isLoadingPatient && !patient;
  const isFirstLoadingStudies =
    isLoadingStudies && studiesByUserId.length === 0;

  const isSignificantRefetching =
    (isRefetchingStudies && studiesByUserId.length > 0) ||
    (isRefetchingUrls && Object.keys(allUrls).length > 0);

  // Renderizamos un placeholder o skeleton mientras los datos se cargan
  if (isFirstLoadingPatient && isFirstLoadingStudies) {
    return (
      <div className="container space-y-2 mt-2">
        <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
          <PatientCardSkeleton />
          <StudiesCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isLoadingPatient
            ? "Paciente"
            : `${patient?.firstName} ${patient?.lastName}`}
        </title>
        <meta
          name="description"
          content={`Información detallada sobre el paciente ${patient?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`paciente, ${patient?.firstName}, perfil`}
        />
      </Helmet>

      {patientError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del paciente.
        </div>
      )}

      <PatientComponent
        patient={patient}
        urls={allUrls}
        studiesByUserId={studiesByUserId}
        isLoadingPatient={isFirstLoadingPatient}
        isLoadingStudies={isFirstLoadingStudies}
        isLoadingUrls={isLoadingUrls && studiesByUserId.length > 0}
        isRefetching={isSignificantRefetching}
      />
    </>
  );
};

export default PatientPage;
