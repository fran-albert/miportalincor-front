import {
  calculateAgeCollaborator,
  formatAddress,
  formatDni,
  getGenderLabel,
} from "@/common/helpers/helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CollaboratorAvatar from "@/components/Collaborators/Avatar";
interface Props {
  collaborator: Collaborator;
  canEdit?: boolean;
  isForPdf?: boolean;
}

const formatBirthDate = (birthDate?: string | null) => {
  if (!birthDate) return "-";

  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) return String(birthDate);

  return parsed.toLocaleDateString("es-AR");
};

export default function CollaboratorInformationCard({
  collaborator,
  canEdit = false,
  isForPdf = false,
}: Props) {
  const navigate = useNavigate();
  const birthDate =
    collaborator.birthDate != null ? String(collaborator.birthDate) : null;
  const company = collaborator.company as typeof collaborator.company & {
    bussinesName?: string;
    fantasyName?: string;
  };
  const companyName =
    company?.name ||
    company?.bussinesName ||
    company?.fantasyName ||
    "Sin empresa asignada";
  const collaboratorName = `${collaborator.firstName} ${collaborator.lastName}`;

  const infoItems = [
    {
      label: "DNI",
      value: formatDni(collaborator.userName),
    },
    {
      label: "Sexo",
      value: getGenderLabel(collaborator.gender),
    },
    {
      label: "Fecha de nacimiento",
      value: formatBirthDate(birthDate),
    },
    {
      label: "Edad",
      value: birthDate
        ? `${calculateAgeCollaborator(birthDate)} años`
        : "Sin fecha de nacimiento",
    },
    {
      label: "Email",
      value:
        collaborator.email && collaborator.email !== "undefined"
          ? collaborator.email
          : "Sin email cargado",
    },
    {
      label: "Celular",
      value: collaborator.phone || "Sin celular cargado",
    },
    {
      label: "Dirección",
      value: formatAddress(collaborator.addressData) || "Sin dirección cargada",
      className: "md:col-span-2",
    },
    {
      label: "Puesto de trabajo",
      value: collaborator.positionJob || "Sin puesto de trabajo asignado",
    },
    ...(!isForPdf
      ? [
          {
            label: "Empresa",
            value: companyName,
          },
        ]
      : []),
  ];

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <CollaboratorAvatar
              photoBuffer={collaborator.photoBuffer}
              alt={collaboratorName}
              size="sm"
            />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-greenPrimary">
                Información del colaborador
              </h2>
              <p className="truncate text-sm text-slate-600">
                {collaboratorName}
                {collaborator.positionJob
                  ? ` · ${collaborator.positionJob}`
                  : ""}
              </p>
            </div>
          </div>
          {canEdit && (
            <Button
              onClick={() =>
                navigate(
                  `/incor-laboral/colaboradores/${collaborator.slug}/editar`
                )
              }
              className="border border-slate-200 bg-white text-greenPrimary hover:bg-slate-50"
              size="sm"
              type="button"
            >
              <Edit2 className="mr-2 h-4 w-4" /> Editar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
          {infoItems.map((item) => {
            return (
              <div
                key={item.label}
                className={`min-w-0 ${item.className ?? ""}`}
              >
                <div className="text-xs font-medium text-slate-500">
                  {item.label}
                </div>
                <p className="mt-1 break-words text-sm font-medium leading-5 text-slate-900">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
