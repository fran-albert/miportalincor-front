import PatientProfileComponent from "@/components/Patients/Profile";
import { usePatient } from "@/hooks/Patient/usePatient";
import { PatientProfileSkeleton } from "@/components/Skeleton/Patient";
import { useParams } from "react-router-dom";
import BreadcrumbComponent from "@/components/Breadcrumb";

const PatientProfilePage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = slugParts[slugParts.length - 1];

  const { isLoading, patient, error } = usePatient({
    auth: true,
    id,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente", href: "/pacientes/" + (slug || "")
    },
    { label: "Perfil Completo", href: "#" }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <BreadcrumbComponent items={breadcrumbItems} />
        <PatientProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4 p-6">
      {patient && (
        <PatientProfileComponent
          patient={patient}
          breadcrumbItems={breadcrumbItems}
        />
      )}
    </div>
  );
};
export default PatientProfilePage;
