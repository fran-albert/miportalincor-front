import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useUserRole from "@/hooks/useRoles";
import {
  Stethoscope,
  Calendar,
  FileImage,
  ClipboardPlus,
} from "lucide-react";

interface PatientModulesProps {
  onHistoriaClinicaClick: () => void;
  onEstudiosClick: () => void;
  onControlNutricionalClick?: () => void;
}

export default function PatientModules({
  onHistoriaClinicaClick,
  onEstudiosClick,
  onControlNutricionalClick,
}: PatientModulesProps) {
  const { isDoctor } = useUserRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
          Módulos del Paciente
        </CardTitle>
        <p className="text-gray-600">
          Accede a la información y servicios del paciente
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Historia Clínica - Solo visible para médicos */}
          {isDoctor && (
            <Button
              onClick={onHistoriaClinicaClick}
              className="h-32 flex flex-col items-center justify-center gap-3 bg-greenPrimary hover:bg-teal-700 text-white"
            >
              <Stethoscope className="h-10 w-10" />
              <span className="font-semibold text-lg">Historia Clínica</span>
            </Button>
          )}

          {/* Control Nutricional */}
          {isDoctor && (
            <Button
              onClick={onControlNutricionalClick}
              className="h-32 flex flex-col items-center justify-center gap-3 bg-greenPrimary hover:bg-teal-700 text-white"
            >
              <ClipboardPlus className="h-10 w-10" />
              <span className="font-semibold text-lg">Control Nutricional</span>
            </Button>
          )}

          {/* Citas Médicas */}
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 border-2 hover:bg-gray-50 bg-transparent"
            disabled
          >
            <Calendar className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <span className="font-semibold text-lg text-gray-400">
                Citas Médicas
              </span>
              <p className="text-xs text-gray-400 mt-1">
                Programar y gestionar citas
              </p>
            </div>
          </Button>

          {/* Estudios */}
          <Button
            onClick={onEstudiosClick}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-greenPrimary hover:bg-teal-700 text-white"
          >
            <FileImage className="h-10 w-10" />
            <div className="text-center">
              <span className="font-semibold text-lg">Estudios</span>
              <p className="text-xs mt-1">Imágenes y laboratorios</p>
            </div>
          </Button>

          {/* Documentos */}
          {/* <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 border-2 hover:bg-gray-50 bg-transparent"
            disabled
          >
            <FileText className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <span className="font-semibold text-lg text-gray-400">
                Documentos
              </span>
              <p className="text-xs text-gray-400 mt-1">
                Archivos y certificados
              </p>
            </div>
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
