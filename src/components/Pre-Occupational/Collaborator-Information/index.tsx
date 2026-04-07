import {
  calculateAgeCollaborator,
  formatAddress,
  formatDni,
  getGenderLabel,
} from "@/common/helpers/helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { BriefcaseBusiness, Edit2, MapPin, ShieldCheck, UserRound } from "lucide-react";
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
  const companyName = collaborator.company?.name || "Sin empresa asignada";
  const collaboratorName = `${collaborator.firstName} ${collaborator.lastName}`;

  const infoItems = [
    {
      label: "DNI",
      value: formatDni(collaborator.userName),
      icon: ShieldCheck,
    },
    {
      label: "Sexo",
      value: getGenderLabel(collaborator.gender),
      icon: UserRound,
    },
    {
      label: "Fecha de nacimiento",
      value: formatBirthDate(birthDate),
      icon: UserRound,
    },
    {
      label: "Edad",
      value: birthDate
        ? `${calculateAgeCollaborator(birthDate)} años`
        : "Sin fecha de nacimiento",
      icon: UserRound,
    },
    {
      label: "Email",
      value:
        collaborator.email && collaborator.email !== "undefined"
          ? collaborator.email
          : "Sin email cargado",
      icon: UserRound,
    },
    {
      label: "Celular",
      value: collaborator.phone || "Sin celular cargado",
      icon: UserRound,
    },
    {
      label: "Dirección",
      value: formatAddress(collaborator.addressData) || "Sin dirección cargada",
      icon: MapPin,
      className: "md:col-span-2",
    },
    {
      label: "Puesto de trabajo",
      value: collaborator.positionJob || "Sin puesto de trabajo asignado",
      icon: BriefcaseBusiness,
    },
    ...(!isForPdf
      ? [
          {
            label: "Empresa",
            value: companyName,
            icon: BriefcaseBusiness,
          },
        ]
      : []),
  ];

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-greenPrimary">
                Información del colaborador
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-700">
                Reunimos los datos personales y laborales en una sola vista para
                que secretaría y médicos validen rápido la identidad del
                colaborador antes de editar o emitir el informe.
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
              type="button"
            >
              <Edit2 className="mr-2 h-4 w-4" /> Editar
            </Button>
          )}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[auto,1fr] lg:items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <CollaboratorAvatar
                photoBuffer={collaborator.photoBuffer}
                alt={collaboratorName}
              />
            </div>
            <p className="mt-3 text-lg font-semibold text-greenPrimary">
              {collaboratorName}
            </p>
            <p className="text-sm text-slate-500">
              {collaborator.positionJob || "Sin puesto asignado"}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Empresa
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {companyName}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Puesto
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {collaborator.positionJob || "Sin puesto asignado"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Edad
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {birthDate
                  ? `${calculateAgeCollaborator(birthDate)} años`
                  : "Sin fecha de nacimiento"}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {infoItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`rounded-xl border border-slate-200 bg-white p-4 ${item.className ?? ""}`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Icon className="h-4 w-4 text-greenPrimary" />
                  {item.label}
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-900">
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
