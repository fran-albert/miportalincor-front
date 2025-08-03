import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";
import {
  PatientCardSkeleton,
  StudiesCardSkeleton,
  StudiesTableSkeleton,
} from "@/components/Skeleton/Patient";
import StudiesComponent from "@/components/Studies/Component";
import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";
import BreadcrumbComponent from "@/components/Breadcrumb";

const PatientStudiesPage = () => {
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

  const isFirstLoadingPatient = isLoadingPatient && !patient;
  const isFirstLoadingStudies = isLoadingStudies;

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

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
      href: `/pacientes/${patient?.slug}`,
    },
    {
      label: patient ? `Estudios Médicos` : "Paciente",
      href: `/pacientes/${patient?.slug}/estudios`,
    },
  ];

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

      <div className="container space-y-2 mt-2">
        <div className="mb-6">
          <BreadcrumbComponent items={breadcrumbItems} />
        </div>

        <div className="space-y-6">
          {/* Patient Information Section */}
          <div className="w-full">
            {isLoadingPatient ? (
              <PatientCardSkeleton />
            ) : (
              patient && <PatientInformation patient={patient} />
            )}
          </div>

          {/* Studies Section */}
          <div className="w-full">
            {isFetching ? (
              <StudiesTableSkeleton />
            ) : (
              studies && (
                <StudiesComponent
                  idUser={Number(patient?.userId)}
                  studies={studies}
                  role="pacientes"
                  isFetchingStudies={isFetching}
                  slug={String(patient?.slug)}
                />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientStudiesPage;
