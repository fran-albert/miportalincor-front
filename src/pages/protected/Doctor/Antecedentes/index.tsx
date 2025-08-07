import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DoctorCardSkeleton } from "@/components/Skeleton/Doctor";
import AntecedentesComponent from "@/components/Antecedentes/Component";
import { useAntecedentes } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import useUserRole from "@/hooks/useRoles";

const DoctorAntecedentesPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const {
    doctor,
    isLoading: isLoadingDoctor,
    error: doctorError,
  } = useDoctor({
    auth: true,
    id,
  });

  const {
    error: antecedentesError,
  } = useAntecedentes({
    auth: true,
    userId: id,
  });

  const { session } = useUserRole();
  const idDoctor = session?.id ? session.id : undefined;
  
  const navigate = useNavigate();

  const isFirstLoadingDoctor = isLoadingDoctor && !doctor;

  if (isFirstLoadingDoctor) {
    return (
      <div className="container space-y-2 mt-2">
        <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
          <DoctorCardSkeleton />
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
            : `${doctor?.firstName} ${doctor?.lastName} - Antecedentes`}
        </title>
        <meta
          name="description"
          content={`Antecedentes médicos del doctor ${doctor?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`médico, ${doctor?.firstName}, antecedentes, historia clínica`}
        />
      </Helmet>

      {doctorError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del médico.
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
      />
    </>
  );
};

export default DoctorAntecedentesPage;