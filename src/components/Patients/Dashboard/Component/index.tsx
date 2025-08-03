import { Patient } from "@/types/Patient/Patient";
import BreadcrumbComponent from "@/components/Breadcrumb";

import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import PatientDashboard from "@/pages/protected/Patient/Dashboard";

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
      href: `/pacientes/${patient?.slug}`,
    },
  ];

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
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
