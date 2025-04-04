import { Patient } from "@/types/Patient/Patient";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { StudiesWithURL } from "@/types/Study/Study";
import StudiesComponent from "@/components/Studies/Component";
import PatientCardComponent from "../View/Card/card";
export function PatientComponent({
  patient,
  studies,
}: {
  patient: Patient | undefined;
  studies: StudiesWithURL[] | undefined;
}) {
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
        {patient && <PatientCardComponent patient={patient} />}
        <div className="md:grid md:gap-6 space-y-4">
          {/* <StudiesCardComponent idUser={Number(patient?.userId)} /> */}
          {studies && (
            <StudiesComponent
              idUser={Number(patient?.userId)}
              studies={studies}
              role="pacientes"
              slug={String(patient?.slug)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
