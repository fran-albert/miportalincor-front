import BreadcrumbComponent from "@/components/Breadcrumb";
import PreOccupationalCards from "../Card";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { MedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";

interface Props {
  Collaborator: Collaborator;
  medicalEvaluation: MedicalEvaluation;
}

export function NewPreOcuppationalComponent({
  Collaborator,
  medicalEvaluation,
}: Props) {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    {
      label: "Colaboradores",
      href: `/incor-laboral/colaboradores`,
    },
    {
      label: Collaborator
        ? `${Collaborator.firstName} ${Collaborator.lastName}`
        : "Incor Laboral",
      href: `/incor-laboral/colaboradores/${Collaborator?.slug}`,
    },
    {
      label: "Examen",
      href: `/incor-laboral/colaboradores/${Collaborator?.slug}/examen`,
    },
  ];

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <PreOccupationalCards
        slug={String(Collaborator?.slug)}
        medicalEvaluation={medicalEvaluation}
        collaborator={Collaborator}
      />
    </div>
  );
}
