import BreadcrumbComponent from "..";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";

export const BreadcrumbComponentGenerator = ({
  role,
  entity,
}: {
  role: "paciente" | "doctor";
  entity: Patient | Doctor | undefined;
}) => {
  const basePath =
    role === "paciente" ? "/pacientes" : "/medicos";
  const entityName = entity
    ? `${entity.firstName} ${entity.lastName}`
    : role === "paciente"
    ? "Paciente"
    : "Médico";

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: role === "paciente" ? "Pacientes" : "Médicos", href: basePath },
    {
      label: entityName,
      href: `${basePath}/${entity?.slug}`,
    },
    {
      label: "Laboratorios",
      href: `${basePath}/${entity?.slug}/laboratorios`,
    },
  ];

  return <BreadcrumbComponent items={breadcrumbItems} />;
};
