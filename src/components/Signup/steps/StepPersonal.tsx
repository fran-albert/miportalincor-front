import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, StepFrame } from "../StepFrame";
import {
  fieldErrors,
  maskBirthDateInput,
  personalSchema,
} from "../signup.schemas";
import { StepProps } from "../types";

const inputClass =
  "h-12 text-base border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary";

export function StepPersonal({
  data,
  onChange,
  onBack,
  onNext,
  nextLabel,
}: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const result = personalSchema.safeParse({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      birthDate: data.birthDate,
    });
    setErrors(fieldErrors(result));
    if (result.success) onNext();
  };

  return (
    <StepFrame
      step={2}
      title="Tus datos"
      description="Revisá que estén bien: así te encontramos en recepción."
      onBack={onBack}
      onNext={handleNext}
      nextLabel={nextLabel}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signup-first-name" className="text-gray-700 font-medium">
            Nombre
          </Label>
          <Input
            id="signup-first-name"
            autoComplete="given-name"
            value={data.firstName}
            aria-invalid={Boolean(errors.firstName)}
            onChange={(event) => onChange({ firstName: event.target.value })}
            className={inputClass}
          />
          <FieldError message={errors.firstName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-last-name" className="text-gray-700 font-medium">
            Apellido
          </Label>
          <Input
            id="signup-last-name"
            autoComplete="family-name"
            value={data.lastName}
            aria-invalid={Boolean(errors.lastName)}
            onChange={(event) => onChange({ lastName: event.target.value })}
            className={inputClass}
          />
          <FieldError message={errors.lastName} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-phone" className="text-gray-700 font-medium">
          Celular
        </Label>
        <Input
          id="signup-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="341 555 1234"
          value={data.phone}
          aria-invalid={Boolean(errors.phone)}
          onChange={(event) => onChange({ phone: event.target.value })}
          className={inputClass}
        />
        <p className="text-sm text-gray-500">
          Con característica, sin 0 ni 15. Por acá te avisamos de tus turnos.
        </p>
        <FieldError message={errors.phone} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-gray-700 font-medium">
          Email <span className="font-normal text-gray-500">(opcional)</span>
        </Label>
        <Input
          id="signup-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={data.email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => onChange({ email: event.target.value })}
          className={inputClass}
        />
        <p className="text-sm text-gray-500">
          Sirve para recuperar tu contraseña si te la olvidás.
        </p>
        <FieldError message={errors.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-birth-date" className="text-gray-700 font-medium">
          Fecha de nacimiento
        </Label>
        <Input
          id="signup-birth-date"
          inputMode="numeric"
          autoComplete="bday"
          placeholder="DD/MM/AAAA"
          value={data.birthDate}
          aria-invalid={Boolean(errors.birthDate)}
          onChange={(event) =>
            onChange({ birthDate: maskBirthDateInput(event.target.value) })
          }
          className={inputClass}
        />
        <FieldError message={errors.birthDate} />
      </div>
    </StepFrame>
  );
}
