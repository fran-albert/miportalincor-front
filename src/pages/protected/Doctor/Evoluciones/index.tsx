import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DoctorCardSkeleton } from "@/components/Skeleton/Doctor";
import React from "react";
import EvolucionesComponent from "@/components/Evoluciones/Component";
import { useEvoluciones } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";

const DoctorEvolucionesPage: React.FC = () => {
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
    evoluciones,
    error: evolucionesError,
  } = useEvoluciones({
    auth: true,
    userId: id,
  });

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
            : `${doctor?.firstName} ${doctor?.lastName} - Evoluciones`}
        </title>
        <meta
          name="description"
          content={`Evoluciones médicas del doctor ${doctor?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`médico, ${doctor?.firstName}, evoluciones`}
        />
      </Helmet>

      {doctorError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar los datos del médico.
        </div>
      )}
      
      {evolucionesError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar las evoluciones.
        </div>
      )}
      
      <EvolucionesComponent
        onBack={() => navigate(-1)}
        evoluciones={evoluciones}
        userData={doctor}
        userType="doctor"
        patientId={id}
      />
    </>
  );
};

export default DoctorEvolucionesPage;