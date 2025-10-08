import { usePatient } from "@/hooks/Patient/usePatient";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import React from "react";
import EvolucionesComponent from "@/components/Evoluciones/Component";
import { useEvoluciones } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";

const PatientEvolucionesPage: React.FC = () => {
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
    evoluciones,
    error: evolucionesError,
  } = useEvoluciones({
    auth: true,
    userId: id,
  });

  const navigate = useNavigate();

  const isFirstLoadingPatient = isLoadingPatient && !patient;

  if (isFirstLoadingPatient) {
    return (
      <div className="container space-y-2 mt-2">
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
      
      {evolucionesError && (
        <div className="p-4 text-red-500">
          Hubo un error al cargar las evoluciones.
        </div>
      )}
      <EvolucionesComponent
        onBack={() => navigate(-1)}
        evoluciones={evoluciones}
        userData={patient}
        userType="patient"
        patientId={id}
      />
    </>
  );
};

export default PatientEvolucionesPage;
