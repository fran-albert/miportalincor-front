import BreadcrumbComponent from "..";

export const BreadcrumbComponentGenerator = ({
  role,
  entity,
}: {
  role: "paciente" | "doctor";
  entity: any;
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
