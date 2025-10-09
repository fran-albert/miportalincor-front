import PatientProfileComponent from "@/components/Patients/Profile";
import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams } from "react-router-dom";

const PatientProfilePage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { isLoading, patient, error } = usePatient({
    auth: true,
    id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div>Cargando perfil del paciente...</div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4 p-6">
      {patient && <PatientProfileComponent patient={patient} />}
    </div>
  );
};

export default PatientProfilePage;
