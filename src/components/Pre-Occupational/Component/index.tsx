import { Patient } from "@/types/Patient/Patient";
import BreadcrumbComponent from "@/components/Breadcrumb";
import PreOccupationalCards from "../Card";
export function PreOcuppationalComponent({
  Collaborator,
}: {
  Collaborator: Patient;
}) {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    {
      label: Collaborator
        ? `${Collaborator.firstName} ${Collaborator.lastName}`
        : "Incor Laboral",
      href: `/incor-laboral/colaboradores/${Collaborator?.slug}`,
    },
  ];

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <PreOccupationalCards slug={String(Collaborator?.slug)} />
    </div>
  );
}
