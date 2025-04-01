import { Patient } from "@/types/Patient/Patient";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { Study } from "@/types/Study/Study";
import StudiesComponent from "@/components/Studies/Component";
import PatientCardComponent from "../View/Card/card";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";

interface PatientComponentProps {
  patient: Patient | undefined;
  studiesByUserId: Study[];
  urls: any;
  isLoadingPatient?: boolean;
  isLoadingStudies?: boolean;
  isLoadingUrls?: boolean;
  isRefetching?: boolean;
}

export function PatientComponent({
  patient,
  studiesByUserId,
  urls,
  isLoadingPatient = false,
  isLoadingStudies = false,
  isLoadingUrls = false,
  isRefetching = false,
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

      {isRefetching && (
        <div className="w-full bg-teal-50 text-greenPrimary px-4 py-2 rounded mb-4 flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-greenPrimary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Actualizando información...
        </div>
      )}

      <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
        {isLoadingPatient ? (
          <PatientCardSkeleton />
        ) : (
          patient && <PatientCardComponent patient={patient} />
        )}

        <div className="md:grid md:gap-6 space-y-4">
          <StudiesComponent
            idUser={Number(patient?.userId)}
            studiesByUserId={studiesByUserId}
            role="pacientes"
            urls={urls}
            slug={String(patient?.slug)}
            isLoading={isLoadingStudies}
            isLoadingUrls={isLoadingUrls}
          />
        </div>
      </div>
    </div>
  );
}
