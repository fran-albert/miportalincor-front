import BreadcrumbComponent from "@/components/Breadcrumb";
import LoadingAnimation from "@/components/Loading/loading";
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

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Pacientes",
      href: `/pacientes/${patient?.slug}`,
    },
    {
      label: patient ? `Perfil Completo` : "Pacientes",
      href: `/pacientes/${patient?.slug}`,
    },
  ];

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <BreadcrumbComponent items={breadcrumbItems} />
      <div className="">
        {patient && <PatientProfileComponent patient={patient} />}
      </div>
    </div>
  );
};

export default PatientProfilePage;
