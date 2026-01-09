import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PatientProfileSkeleton } from "@/components/Skeleton/Patient";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { AppointmentsSection } from "@/components/Patients/Dashboard/AppointmentsSection";
import { Skeleton } from "@/components/ui/skeleton";

const PatientAppointmentsPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = slugParts[slugParts.length - 1];

  const {
    patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = usePatient({
    auth: true,
    id,
  });

  const isFirstLoadingPatient = isLoadingPatient && !patient;

  if (isFirstLoadingPatient) {
    return (
      <div className="space-y-4 p-6">
        <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
          <PatientProfileSkeleton />
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
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
      label: "Turnos",
      href: `/pacientes/${patient?.slug}/turnos`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          {isLoadingPatient
            ? "Turnos del Paciente"
            : `Turnos - ${patient?.firstName} ${patient?.lastName}`}
        </title>
        <meta
          name="description"
          content={`Turnos y citas médicas del paciente ${patient?.firstName}.`}
        />
      </Helmet>

      {patientError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del paciente.
        </div>
      )}

      <div className="space-y-6 p-6">
        <BreadcrumbComponent items={breadcrumbItems} />

        {patient && (
          <AppointmentsSection
            patientUserId={Number(patient.userId)}
            patientData={{
              userId: Number(patient.userId),
              firstName: patient.firstName,
              lastName: patient.lastName,
              userName: patient.userName,
            }}
          />
        )}
      </div>
    </>
  );
};

export default PatientAppointmentsPage;
