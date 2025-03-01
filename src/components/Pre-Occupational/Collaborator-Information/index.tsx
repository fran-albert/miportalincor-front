import { useState } from "react";
import {
  calculateAge,
  formatDni,
  getGenderLabel,
} from "@/common/helpers/helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { Edit2, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
interface Props {
  collaborator: Collaborator;
  canEdit?: boolean;
  onEditClick?: () => void;
  isForPdf?: boolean;
}

export default function CollaboratorInformationCard({
  collaborator,
  canEdit = false,
  isForPdf = false,
  onEditClick,
}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const photoUrl = collaborator.photoUrl;
  const hasValidImage = !!photoUrl && photoUrl.trim() !== "";
  return (
    <Card className="shadow-lg border border-gray-200 rounded-lg">
      <CardHeader className="flex flex-col items-center p-6 rounded-t-lg">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-xl font-semibold text-greenPrimary">
            Información del Colaborador
          </h2>
          {canEdit && (
            <Button
              onClick={onEditClick}
              className="bg-greenPrimary hover:bg-teal-800 text-white px-4 py-2 rounded-md flex items-center transition duration-200"
              type="button"
            >
              <Edit2 className="mr-2 h-4 w-4" /> Editar
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="relative flex flex-col items-center">
            {hasValidImage && !imageLoaded && (
              <Skeleton className="w-[100px] h-[20px] rounded-full" />
            )}
            {hasValidImage ? (
              <img
                src={photoUrl}
                alt={`${collaborator.firstName} ${collaborator.lastName}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                className={`h-32 w-32 object-cover border-2 border-greenPrimary shadow-md ${
                  imageLoaded ? "block" : "hidden"
                }`}
              />
            ) : null}
            {!hasValidImage || !imageLoaded ? (
              <div className="h-24 w-24 flex items-center justify-center bg-gray-200 rounded-full border-2 border-gray-300 shadow-md">
                <User className="h-12 w-12 text-gray-500" />
              </div>
            ) : null}
          </div>
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
              {collaborator.address ? String(collaborator.address) : "S/D"}
            </p>
          </div>

          <div className="rounded-lg">
            <p className="text-sm text-gray-500">Lugar de Trabajo:</p>
            <p className="font-medium">Trabajos en altura</p>
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
