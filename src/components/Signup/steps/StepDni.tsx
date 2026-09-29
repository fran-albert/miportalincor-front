import { useState } from "react";
import { Clock, IdCard, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, Notice, StepFrame } from "../StepFrame";
import { dniSchema, fieldErrors, normalizeDni } from "../signup.schemas";
import { StepProps } from "../types";

interface StepDniProps extends StepProps {
  /** El DNI vino con el link de la reserva: no se puede cambiar. */
  locked: boolean;
  /** El link venció o ya se usó: se avisa y se carga todo a mano. */
  tokenExpired: boolean;
  isChecking: boolean;
  error?: string;
}

export function StepDni({
  data,
  onChange,
  onNext,
  locked,
  tokenExpired,
  isChecking,
  error,
}: StepDniProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const result = dniSchema.safeParse({ dni: data.dni });
    const nextErrors = fieldErrors(result);
    setErrors(nextErrors);
    if (result.success) {
      onChange({ dni: result.data.dni });
      onNext();
    }
  };

  return (
    <StepFrame
      step={1}
      title="Creá tu cuenta"
      description="Empezamos por tu DNI."
      onNext={handleNext}
      isNextLoading={isChecking}
    >
      {tokenExpired && (
        <Notice
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          testId="signup-token-expired"
        >
          <p>
            El link para crear tu cuenta venció o ya se usó. Podés crear la
            cuenta igual: cargá tus datos a mano.
          </p>
        </Notice>
      )}

      <div className="space-y-2">
        <Label htmlFor="signup-dni" className="text-gray-700 font-medium">
          DNI
        </Label>
        <div className="relative">
          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            id="signup-dni"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Tu DNI sin puntos"
            value={data.dni}
            readOnly={locked}
            aria-invalid={Boolean(errors.dni)}
            aria-describedby="signup-dni-help"
            onChange={(event) =>
              onChange({ dni: normalizeDni(event.target.value).slice(0, 8) })
            }
            className={
              locked
                ? "pl-10 pr-10 h-12 text-lg bg-gray-50 text-gray-700 border-gray-200"
                : "pl-10 h-12 text-lg border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary"
            }
          />
          {locked && (
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
        </div>
        <p id="signup-dni-help" className="text-sm text-gray-500">
          {locked
            ? "Es el DNI con el que sacaste tu turno."
            : "Solo números, sin puntos."}
        </p>
        <FieldError message={errors.dni} />
      </div>

      {error && (
        <Notice icon={<Clock className="h-4 w-4 text-red-600" />} tone="error">
          <p>{error}</p>
        </Notice>
      )}
    </StepFrame>
  );
}
