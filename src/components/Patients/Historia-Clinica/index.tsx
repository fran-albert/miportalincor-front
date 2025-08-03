import { Patient } from "@/types/Patient/Patient";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { StudiesWithURL } from "@/types/Study/Study";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import { AntecedentesResponse } from "@/types/Antecedentes/Antecedentes";
import PatientHistory from "@/components/Historia-Clinica/Component";

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
  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />

      <div className="gap-6">
        {isLoadingPatient ? (
          <PatientCardSkeleton />
        ) : (
          patient && (
            <PatientHistory patient={patient} antecedentes={antecedentes} />
          )
        )}
      </div>
    </div>
  );
}
