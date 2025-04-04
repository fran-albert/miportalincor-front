import { Patient } from "@/types/Patient/Patient";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { StudiesWithURL } from "@/types/Study/Study";
import StudiesComponent from "@/components/Studies/Component";
import PatientCardComponent from "../View/Card/card";
import {
  PatientCardSkeleton,
  StudiesTableSkeleton,
} from "@/components/Skeleton/Patient";

interface PatientComponentProps {
  patient: Patient | undefined;
  studies: StudiesWithURL[] | undefined;
  isLoadingPatient: boolean;
  isFetchingStudies: boolean;
  isLoadingUrls?: boolean;
  isRefetching?: boolean;
}

export function PatientComponent({
  patient,
  studies,
  isLoadingPatient,
  isFetchingStudies,
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

      <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
        {isLoadingPatient ? (
          <PatientCardSkeleton />
        ) : (
          patient && <PatientCardComponent patient={patient} />
        )}

        <div className="md:grid md:gap-6 space-y-4">
          {isFetchingStudies ? (
            <StudiesTableSkeleton />
          ) : (
            studies &&
            studies.length > 0 && (
              <StudiesComponent
                idUser={Number(patient?.userId)}
                studies={studies}
                role="pacientes"
                isFetchingStudies={isFetchingStudies}
                slug={String(patient?.slug)}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
