import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useUserRole from "@/hooks/useRoles";
import {
  Stethoscope,
  Calendar,
  FileImage,
  ClipboardPlus,
  Users,
  Building2,
} from "lucide-react";

interface DoctorModulesProps {
  onHistoriaClinicaClick: () => void;
  onEstudiosClick?: () => void;
  onControlNutricionalClick?: () => void;
  onPacientesClick?: () => void;
  onEspecialidadesClick?: () => void;
}

export default function DoctorModules({
  onHistoriaClinicaClick,
  onEstudiosClick,
  onControlNutricionalClick,
  onPacientesClick,
  onEspecialidadesClick,
}: DoctorModulesProps) {
  const { isDoctor, isAdmin } = useUserRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
          Módulos del Médico
        </CardTitle>
        <p className="text-gray-600">
          Accede a la información y servicios profesionales
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Historia Clínica */}
          <Button
            onClick={onHistoriaClinicaClick}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-greenPrimary hover:bg-teal-700 text-white"
          >
            <Stethoscope className="h-10 w-10" />
            <span className="font-semibold text-lg">Historia Clínica</span>
          </Button>

          {/* Control Nutricional */}
          <Button
            onClick={onControlNutricionalClick}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-greenPrimary hover:bg-teal-700 text-white"
          >
            <ClipboardPlus className="h-10 w-10" />
            <span className="font-semibold text-lg">Control Nutricional</span>
          </Button>

          {/* Mis Pacientes */}
          <Button
            onClick={onPacientesClick}
            className="h-32 flex flex-col items-center justify-center gap-3 bg-greenPrimary hover:bg-teal-700 text-white"
          >
            <Users className="h-10 w-10" />
            <div className="text-center">
              <span className="font-semibold text-lg">Mis Pacientes</span>
              <p className="text-xs mt-1">Pacientes bajo mi cuidado</p>
            </div>
          </Button>

          {/* Citas Médicas */}
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 border-2 hover:bg-gray-50 bg-transparent"
            disabled
          >
            <Calendar className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <span className="font-semibold text-lg text-gray-400">
                Agenda Médica
              </span>
              <p className="text-xs text-gray-400 mt-1">
                Horarios y citas programadas
              </p>
            </div>
          </Button>


          {/* Estudios */}
          {onEstudiosClick && (
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
          )}

          {/* Especialidades - Solo para médicos con permisos */}
          {(isDoctor || isAdmin) && (
            <Button
              onClick={onEspecialidadesClick}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-teal-300 hover:bg-teal-50 bg-transparent"
            >
              <Building2 className="h-10 w-10 text-teal-600" />
              <div className="text-center">
                <span className="font-semibold text-lg text-teal-600">
                  Especialidades
                </span>
                <p className="text-xs text-teal-600 mt-1">
                  Gestión de especialidades
                </p>
              </div>
            </Button>
          )}

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
                Certificados y archivos
              </p>
            </div>
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
