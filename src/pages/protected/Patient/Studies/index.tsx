import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useGetStudyWithUrlByUserId } from "@/hooks/Study/useGetStudyWithUrlByUserId";
import {
  PatientCardSkeleton,
  StudiesCardSkeleton,
} from "@/components/Skeleton/Patient";
import { PatientStudiesPage as GenericPatientStudiesPage } from "@/components/Studies/Page";
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
      <div className="space-y-4 p-6">
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

      <div className="space-y-4 p-6">
        <div className="mb-6">
          <BreadcrumbComponent items={breadcrumbItems} />
        </div>

        <div className="space-y-6">
          {/* Studies Section with Modern Table */}
          <div className="w-full">
            {studies && (
              <GenericPatientStudiesPage
                userData={patient}
                studies={studies}
                loading={isFetching}
                role="pacientes"
                slug={String(patient?.slug)}
                idUser={Number(patient?.userId)}
                showUserInfo={false} // Ya mostramos la info del paciente arriba
                breadcrumbItems={[]} // Sin breadcrumbs porque ya los mostramos
                onRefresh={() => {
                  // Aquí puedes agregar lógica de refresh si es necesaria
                  window.location.reload();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientStudiesPage;
