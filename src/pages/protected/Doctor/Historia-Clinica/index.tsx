import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAntecedentes, useEvoluciones, useMedicacionActual } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import { HistoryPage } from "@/components/Historia-Clinica/Page";

const DoctorHistoryPage = () => {
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
    antecedentes,
    isLoading: isLoadingAntecedentes,
    error: antecedentesError,
  } = useAntecedentes({
    auth: true,
    userId: id,
  });

  const {
    evoluciones,
    isLoading: isLoadingEvoluciones,
    error: evolucionesError,
  } = useEvoluciones({
    auth: true,
    userId: id,
  });

  const {
    medicacionActual,
    isLoading: isLoadingMedicacionActual,
    error: medicacionActualError,
  } = useMedicacionActual({
    auth: true,
    userId: id,
    queryParams: {
      status: 'ACTIVE',
      includeDoctor: true
    },
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: doctor ? `/medicos/${doctor.slug}` : "/medicos",
    },
    {
      label: "Historia Clínica",
      href: doctor ? `/medicos/${doctor.slug}/historia-clinica` : "#",
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          {isLoadingDoctor
            ? "Doctor"
            : `${doctor?.firstName} ${doctor?.lastName} - Historia Clínica`}
        </title>
        <meta
          name="description"
          content={`Historia clínica del doctor ${doctor?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`doctor, ${doctor?.firstName}, historia clínica, médico`}
        />
      </Helmet>

      <HistoryPage
        userData={doctor}
        userType="doctor"
        antecedentes={antecedentes}
        evoluciones={evoluciones}
        medicacionActual={medicacionActual}
        isLoadingUser={isLoadingDoctor}
        isLoadingAntecedentes={isLoadingAntecedentes}
        isLoadingEvoluciones={isLoadingEvoluciones}
        isLoadingMedicacionActual={isLoadingMedicacionActual}
        breadcrumbItems={breadcrumbItems}
        userError={doctorError}
        antecedentesError={antecedentesError}
        evolucionesError={evolucionesError}
        medicacionActualError={medicacionActualError}
        patientId={id}
      />
    </>
  );
};

export default DoctorHistoryPage;