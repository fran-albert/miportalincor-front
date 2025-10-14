import { Patient } from "@/types/Patient/Patient";
import { PageHeader } from "@/components/PageHeader";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import PatientDashboard from "@/pages/protected/Patient/Dashboard";
import { Users } from "lucide-react";

interface PatientComponentProps {
  patient: Patient | undefined;
  isLoadingPatient: boolean;
  isLoadingUrls?: boolean;
  isRefetching?: boolean;
}

export function PatientDashboardComponent({
  patient,
  isLoadingPatient,
}: PatientComponentProps) {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={patient ? `${patient.firstName} ${patient.lastName}` : "Paciente"}
        description="Información completa del paciente y acceso a módulos"
        icon={<Users className="h-6 w-6" />}
      />

      <div className="gap-6">
        {isLoadingPatient ? (
          <PatientCardSkeleton />
        ) : (
          patient && <PatientDashboard patient={patient} />
        )}
      </div>
    </div>
  );
}
