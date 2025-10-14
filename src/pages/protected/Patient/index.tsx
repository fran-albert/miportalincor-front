import { usePatient } from "@/hooks/Patient/usePatient";
import { PatientDashboardComponent } from "@/components/Patients/Dashboard/Component";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  PatientProfileSkeleton,
  StudyRowSkeleton,
} from "@/components/Skeleton/Patient";

const PatientDashboardPage = () => {
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

  const isFirstLoadingPatient = isLoadingPatient && !patient;
  if (isFirstLoadingPatient) {
    return (
      <div className="space-y-4 p-6">
        <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
          <PatientProfileSkeleton />
          <StudyRowSkeleton />
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
      <PatientDashboardComponent
        patient={patient}
        isLoadingPatient={isFirstLoadingPatient}
      />
    </>
  );
};

export default PatientDashboardPage;
