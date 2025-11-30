import { usePatient } from "@/hooks/Patient/usePatient";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AntecedentesComponent from "@/components/Antecedentes/Component";
import { useAntecedentes } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import useUserRole from "@/hooks/useRoles";
import { PatientProfileSkeleton } from "@/components/Skeleton/Patient";

const PatientAntecedentesPage = () => {
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

  const {
    error: antecedentesError,
  } = useAntecedentes({
    auth: true,
    userId: patient?.userId ? Number(patient.userId) : 0,
  });

  const { session } = useUserRole();
  const idDoctor = session?.id ? session.id : undefined;
  
  const navigate = useNavigate();

  const isFirstLoadingPatient = isLoadingPatient && !patient;

  if (isFirstLoadingPatient) {
    return (
      <div className="space-y-4 p-6">
        <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
          <PatientProfileSkeleton />
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
            : `${patient?.firstName} ${patient?.lastName} - Antecedentes`}
        </title>
        <meta
          name="description"
          content={`Antecedentes médicos del paciente ${patient?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`paciente, ${patient?.firstName}, antecedentes, historia clínica`}
        />
      </Helmet>

      {patientError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del paciente.
        </div>
      )}
      
      {antecedentesError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los antecedentes.
        </div>
      )}

      <AntecedentesComponent
        onBack={() => navigate(-1)}
        idUser={String(id)}
        idDoctor={idDoctor}
        patient={patient}
      />
    </>
  );
};

export default PatientAntecedentesPage;
