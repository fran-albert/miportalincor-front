import { Patient } from "@/types/Patient/Patient";
import { StudiesWithURL } from "@/types/Study/Study";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import { AntecedentesResponse } from "@/types/Antecedentes/Antecedentes";
import { PatientHistoryWrapper } from "@/components/Historia-Clinica/Wrapper";

interface PatientComponentProps {
  patient: Patient | undefined;
  studies: StudiesWithURL[] | undefined;
  isLoadingPatient: boolean;
  antecedentes: AntecedentesResponse | undefined;
  isLoadingAntecedentes: boolean;
  isFetchingStudies: boolean;
  isLoadingUrls?: boolean;
  isRefetching?: boolean;
}

export function PatientHistoryComponent({
  patient,
  isLoadingPatient,
  antecedentes,
}: PatientComponentProps) {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
      href: `/pacientes/${patient?.slug}`,
    },
    {
      label: patient ? `Historia Clínica` : "Paciente",
      href: `/pacientes/${patient?.slug}/historia-clinica`,
    },
  ];
  if (isLoadingPatient) {
    return (
      <div className="container space-y-2 mt-2">
        <PatientCardSkeleton />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container space-y-2 mt-2">
        <p>Paciente no encontrado</p>
      </div>
    );
  }

  return (
    <PatientHistoryWrapper
      userData={patient}
      antecedentes={antecedentes}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
