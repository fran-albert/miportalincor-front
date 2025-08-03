import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";
import { useAntecedentes } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import {
  PatientCardSkeleton,
  StudiesCardSkeleton,
} from "@/components/Skeleton/Patient";
import { PatientHistoryComponent } from "@/components/Patients/Historia-Clinica";

const PatientHistoryPage = () => {
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
    data: studies,
    isLoading: isLoadingStudies,
    isFetching,
  } = useGetStudyWithUrlByUserId({
    userId: id,
    auth: true,
  });

  const {
    antecedentes,
    isLoading: isLoadingAntecedentes,
    error: antecedentesError,
  } = useAntecedentes({
    auth: true,
    userId: id,
  });

  const isFirstLoadingPatient = isLoadingPatient && !patient;
  const isFirstLoadingStudies = isLoadingStudies;
  const isFirstLoadingAntecedentes = isLoadingAntecedentes && !antecedentes;

  if (
    isFirstLoadingPatient &&
    isFirstLoadingStudies &&
    isFirstLoadingAntecedentes
  ) {
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
      {antecedentesError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los antecedentes del paciente.
        </div>
      )}
      <PatientHistoryComponent
        patient={patient}
        studies={studies}
        antecedentes={antecedentes}
        isLoadingPatient={isFirstLoadingPatient}
        isFetchingStudies={isFetching}
        isLoadingAntecedentes={isFirstLoadingAntecedentes}
      />
    </>
  );
};

export default PatientHistoryPage;
