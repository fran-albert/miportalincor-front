import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface ContraindicationsAlertProps {
  contraindications?: string;
  diagnosis?: string;
}

/**
 * Zonas a evitar y movimientos contraindicados, arriba de todo y en TODAS las
 * pestañas de la inscripción. Es lo que el kinesiólogo y el profesor tienen
 * que ver antes de la sesión sin depender de encontrar la hoja: el campo de
 * mayor impacto sobre la seguridad del paciente.
 */
export default function ContraindicationsAlert({
  contraindications,
  diagnosis,
}: ContraindicationsAlertProps) {
  if (!contraindications?.trim()) return null;

  return (
    <Alert className="border-red-300 bg-red-50 text-red-900">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Zonas a evitar / movimientos contraindicados</AlertTitle>
      <AlertDescription className="space-y-1">
        <p className="font-medium whitespace-pre-line">{contraindications}</p>
        {diagnosis?.trim() && (
          <p className="text-sm text-red-800">Diagnóstico: {diagnosis}</p>
        )}
      </AlertDescription>
    </Alert>
  );
}
