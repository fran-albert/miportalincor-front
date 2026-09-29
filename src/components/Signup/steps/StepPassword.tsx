import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { FieldError, StepFrame } from "../StepFrame";
import {
  MIN_PASSWORD_LENGTH,
  buildPasswordSchema,
  fieldErrors,
} from "../signup.schemas";
import { StepProps } from "../types";

const inputClass =
  "h-12 text-base border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary";

function Rule({ ok, children }: { ok: boolean; children: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="h-4 w-4 text-greenPrimary" aria-hidden />
      ) : (
        <Circle className="h-4 w-4 text-gray-300" aria-hidden />
      )}
      <span className={ok ? "text-gray-800" : "text-gray-500"}>{children}</span>
    </li>
  );
}

export function StepPassword({
  data,
  onChange,
  onBack,
  onNext,
  nextLabel,
}: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const result = buildPasswordSchema(data.dni).safeParse({
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    setErrors(fieldErrors(result));
    if (result.success) onNext();
  };

  return (
    <StepFrame
      step={5}
      title="Tu contraseña"
      description="La vas a usar junto con tu DNI para entrar a Mi Portal."
      onBack={onBack}
      onNext={handleNext}
      nextLabel={nextLabel}
    >
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-gray-700 font-medium">
          Contraseña
        </Label>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          value={data.password}
          aria-invalid={Boolean(errors.password)}
          onChange={(event) => onChange({ password: event.target.value })}
          className={inputClass}
        />
        <FieldError message={errors.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password-confirm" className="text-gray-700 font-medium">
          Repetí la contraseña
        </Label>
        <PasswordInput
          id="signup-password-confirm"
          autoComplete="new-password"
          value={data.confirmPassword}
          aria-invalid={Boolean(errors.confirmPassword)}
          onChange={(event) => onChange({ confirmPassword: event.target.value })}
          className={inputClass}
        />
        <FieldError message={errors.confirmPassword} />
      </div>

      <ul className="space-y-1.5" aria-label="Requisitos de la contraseña">
        <Rule ok={data.password.length >= MIN_PASSWORD_LENGTH}>
          Al menos 8 caracteres
        </Rule>
        <Rule ok={data.password !== "" && data.password.trim() !== data.dni}>
          Distinta de tu DNI
        </Rule>
        <Rule ok={data.password !== "" && data.password === data.confirmPassword}>
          Las dos iguales
        </Rule>
      </ul>
    </StepFrame>
  );
}
