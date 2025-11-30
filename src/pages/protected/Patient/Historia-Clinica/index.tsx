import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  useAntecedentes,
  useEvoluciones,
  useMedicacionActual,
} from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import { HistoryPage } from "@/components/Historia-Clinica/Page";

const PatientHistoryPage = () => {
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
    antecedentes,
    isLoading: isLoadingAntecedentes,
    error: antecedentesError,
  } = useAntecedentes({
    auth: true,
    userId: patient?.userId ? Number(patient.userId) : 0,
  });

  const {
    evoluciones,
    isLoading: isLoadingEvoluciones,
    error: evolucionesError,
  } = useEvoluciones({
    auth: true,
    userId: patient?.userId ? Number(patient.userId) : 0,
  });

  const {
    medicacionActual,
    isLoading: isLoadingMedicacionActual,
    error: medicacionActualError,
  } = useMedicacionActual({
    auth: true,
    userId: patient?.userId ? Number(patient.userId) : 0,
    queryParams: {
      status: 'ACTIVE',
      includeDoctor: true
    },
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
      href: `/pacientes/${patient?.slug}`,
    },
    {
      label: "Historia Clínica",
      href: `/pacientes/${patient?.slug}/historia-clinica`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          {isLoadingPatient
            ? "Paciente"
            : `${patient?.firstName} ${patient?.lastName} - Historia Clínica`}
        </title>
        <meta
          name="description"
          content={`Historia clínica del paciente ${patient?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`paciente, ${patient?.firstName}, historia clínica`}
        />
      </Helmet>

      <HistoryPage
        userData={patient}
        userType="patient"
        antecedentes={antecedentes}
        evoluciones={evoluciones}
        medicacionActual={medicacionActual}
        isLoadingUser={isLoadingPatient}
        isLoadingAntecedentes={isLoadingAntecedentes}
        isLoadingEvoluciones={isLoadingEvoluciones}
        isLoadingMedicacionActual={isLoadingMedicacionActual}
        breadcrumbItems={breadcrumbItems}
        userError={patientError}
        antecedentesError={antecedentesError}
        evolucionesError={evolucionesError}
        medicacionActualError={medicacionActualError}
        patientId={patient?.userId ? Number(patient.userId) : 0}
      />
    </>
  );
};

export default PatientHistoryPage;
