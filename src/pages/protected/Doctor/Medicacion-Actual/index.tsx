import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MedicacionActualComponent from "@/components/Current-Medication/Component";
import useUserRole from "@/hooks/useRoles";
import { PatientProfileSkeleton } from "@/components/Skeleton/Patient";

const DoctorMedicacionActualPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { session } = useUserRole();
  const currentUserType = (Array.isArray(session?.role) && session.role.includes('Medico')) ? 'doctor' : 'patient';
  const navigate = useNavigate();

  const {
    doctor,
    isLoading: isLoadingDoctor,
    error: doctorError,
  } = useDoctor({
    auth: true,
    id,
  });

  const isFirstLoadingDoctor = isLoadingDoctor && !doctor;

  if (isFirstLoadingDoctor) {
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
          {isLoadingDoctor
            ? "Médico"
            : `${doctor?.firstName} ${doctor?.lastName} - Medicación Actual`}
        </title>
        <meta
          name="description"
          content={`Medicación actual del médico ${doctor?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`médico, ${doctor?.firstName}, medicación actual, historia clínica`}
        />
      </Helmet>

      {doctorError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del médico.
        </div>
      )}

      {doctor && (
        <MedicacionActualComponent
          onBack={() => navigate(-1)}
          userData={doctor}
          userType="doctor"
          currentUserType={currentUserType}
        />
      )}
    </>
  );
};

export default DoctorMedicacionActualPage;