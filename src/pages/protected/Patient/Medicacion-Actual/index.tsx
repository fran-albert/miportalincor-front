import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import MedicacionActualComponent from "@/components/Current-Medication/Component";
import useUserRole from "@/hooks/useRoles";

const PatientMedicacionActualPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { session } = useUserRole();
  const currentUserType = (Array.isArray(session?.role) && session.role.includes('Medico')) ? 'doctor' : 'patient';
  const navigate = useNavigate();

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
          <PatientCardSkeleton />
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
            : `${patient?.firstName} ${patient?.lastName} - Medicación Actual`}
        </title>
        <meta
          name="description"
          content={`Medicación actual del paciente ${patient?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`paciente, ${patient?.firstName}, medicación actual, historia clínica`}
        />
      </Helmet>

      {patientError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del paciente.
        </div>
      )}

      {patient && (
        <MedicacionActualComponent
          onBack={() => navigate(-1)}
          userData={patient}
          userType="patient"
          currentUserType={currentUserType}
          patient={patient}
        />
      )}
    </>
  );
};

export default PatientMedicacionActualPage;