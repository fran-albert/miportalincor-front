import {
  calculateAge,
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

export default function CollaboratorInformationCard({
  collaborator,
  canEdit = false,
  isForPdf = false,
}: Props) {
  const navigate = useNavigate();
  return (
    <Card className="shadow-lg border border-gray-200 rounded-lg">
      <CardHeader className="flex flex-col items-center p-6 rounded-t-lg">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-xl font-semibold text-greenPrimary">
            Información del Colaborador
          </h2>
          {canEdit && (
            <Button
              onClick={() =>
                navigate(
                  `/incor-laboral/colaboradores/${collaborator.slug}/editar`
                )
              }
              className="bg-greenPrimary hover:bg-teal-800 text-white px-4 py-2 rounded-md flex items-center transition duration-200"
              type="button"
            >
              <Edit2 className="mr-2 h-4 w-4" /> Editar
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-col items-center">
          <CollaboratorAvatar
            photoBuffer={collaborator.photoBuffer}
            alt={`${collaborator.firstName} ${collaborator.lastName}`}
          />
          <p className="mt-2 text-lg font-medium">
            {collaborator.firstName} {collaborator.lastName}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-lg">
            <p className="text-sm text-gray-500">DNI:</p>
            <p className="font-medium">{formatDni(collaborator.userName)}</p>
          </div>

          <div className="rounded-lg">
            <p className="text-sm text-gray-500">Sexo:</p>
            <p className="font-medium">{getGenderLabel(collaborator.gender)}</p>
          </div>

          <div className="rounded-lg">
            <p className="text-sm text-gray-500">Fecha de Nac.:</p>
            <p className="font-medium">{String(collaborator.birthDate)}</p>
          </div>

          <div className="rounded-lg">
            <p className="text-sm text-gray-500">Edad:</p>
            <p className="font-medium">
              {calculateAge(String(collaborator.birthDate))} años
            </p>
          </div>

          <div className="rounded-lg">
            <p className="text-sm text-gray-500">Email:</p>
            <p className="font-medium">{collaborator.email}</p>
          </div>

          <div className="rounded-lg">
            <p className="text-sm text-gray-500">Celular:</p>
            <p className="font-medium">{collaborator.phone}</p>
          </div>

          <div className="rounded-lg">
            <p className="text-sm text-gray-500">Dirección:</p>
            <p className="font-medium">
              {formatAddress(collaborator.addressData)}
            </p>
          </div>

          <div className="rounded-lg">
            <p className="text-sm text-gray-500">Puesto de Trabajo:</p>
            <p className="font-medium">
              {collaborator.healthInsurance?.name
                ? `${collaborator.healthInsurance.name} - ${
                    collaborator.affiliationNumber || "Sin número de afiliación"
                  }`
                : "Sin obra social asignada"}
            </p>
          </div>
          {!isForPdf && (
            <div className="rounded-lg">
              <p className="text-sm text-gray-500">Empresa:</p>
              <p className="font-medium">{collaborator.company.name}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
