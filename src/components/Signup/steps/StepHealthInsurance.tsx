import { useMemo, useState } from "react";
import { Check, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignupHealthInsurance } from "@/types/Signup/Signup";
import { FieldError, Notice, StepFrame } from "../StepFrame";
import { SearchableList } from "../SearchableList";
import {
  buildHealthInsuranceSchema,
  fieldErrors,
  normalizeAffiliationNumber,
} from "../signup.schemas";
import { StepProps } from "../types";

interface StepHealthInsuranceProps extends StepProps {
  insurances: SignupHealthInsurance[];
  isLoading: boolean;
  loadError: boolean;
}

export function StepHealthInsurance({
  data,
  onChange,
  onBack,
  onNext,
  nextLabel,
  insurances,
  isLoading,
  loadError,
}: StepHealthInsuranceProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selected = useMemo(
    () => insurances.find((i) => i.id === data.healthInsuranceId) ?? null,
    [insurances, data.healthInsuranceId]
  );

  const selectInsurance = (insurance: SignupHealthInsurance) => {
    const onlyPlan = insurance.plans.length === 1 ? insurance.plans[0] : null;
    onChange({
      healthInsuranceId: insurance.id,
      healthInsuranceName: insurance.name,
      requiresAffiliationNumber: insurance.requiresAffiliationNumber,
      healthPlanId: onlyPlan?.id ?? null,
      healthPlanName: onlyPlan?.name ?? "",
      affiliationNumber: insurance.requiresAffiliationNumber
        ? data.affiliationNumber
        : "",
    });
    setErrors({});
  };

  const clearInsurance = () => {
    onChange({
      healthInsuranceId: null,
      healthInsuranceName: "",
      healthPlanId: null,
      healthPlanName: "",
    });
  };

  const handleNext = () => {
    const result = buildHealthInsuranceSchema(selected).safeParse({
      healthInsuranceId: data.healthInsuranceId,
      healthPlanId: data.healthPlanId,
      affiliationNumber: data.affiliationNumber,
    });
    setErrors(fieldErrors(result));
    if (result.success) {
      onChange({
        affiliationNumber: selected?.requiresAffiliationNumber
          ? normalizeAffiliationNumber(data.affiliationNumber)
          : "",
      });
      onNext();
    }
  };

  return (
    <StepFrame
      step={3}
      title="Tu obra social"
      description="Elegila de la lista, tal como figura en tu credencial."
      onBack={onBack}
      onNext={handleNext}
      nextLabel={nextLabel}
    >
      {loadError && (
        <Notice icon={<Info className="h-4 w-4 text-red-600" />} tone="error">
          <p>No pudimos traer la lista de obras sociales. Probá de nuevo en un rato.</p>
        </Notice>
      )}

      {!selected ? (
        <div className="space-y-2">
          <Label htmlFor="signup-health-search" className="text-gray-700 font-medium">
            Obra social
          </Label>
          <SearchableList
            inputId="signup-health-search"
            testId="signup-health-list"
            placeholder="Buscá tu obra social"
            emptyText="No la encontramos. Elegí PARTICULAR y avisá en recepción."
            isLoading={isLoading}
            invalid={Boolean(errors.healthInsuranceId)}
            options={insurances.map((i) => ({ id: i.id, label: i.name }))}
            onSelect={(option) => {
              const insurance = insurances.find((i) => i.id === option.id);
              if (insurance) selectInsurance(insurance);
            }}
          />
          <FieldError message={errors.healthInsuranceId} />
          <p className="text-sm text-gray-500">
            ¿No está tu obra social? Elegí <strong>PARTICULAR</strong> y avisá
            en recepción.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
            data-testid="signup-health-selected"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Shield className="h-5 w-5 shrink-0 text-greenPrimary" />
              <span className="font-medium text-gray-900 truncate">
                {selected.name}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="text-greenPrimary hover:text-teal-700 shrink-0"
              onClick={clearInsurance}
            >
              Cambiar
            </Button>
          </div>

          {selected.plans.length > 1 && (
            <fieldset className="space-y-2">
              <legend className="text-sm text-gray-700 font-medium mb-2">Plan</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {selected.plans.map((plan) => {
                  const active = plan.id === data.healthPlanId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        onChange({ healthPlanId: plan.id, healthPlanName: plan.name })
                      }
                      className={
                        active
                          ? "flex items-center justify-between rounded-lg border-2 border-greenPrimary bg-white px-4 py-3 text-left text-base font-medium text-gray-900"
                          : "flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-base text-gray-800 hover:border-gray-300"
                      }
                    >
                      {plan.name}
                      {active && <Check className="h-4 w-4 text-greenPrimary" />}
                    </button>
                  );
                })}
              </div>
              <FieldError message={errors.healthPlanId} />
            </fieldset>
          )}

          {selected.requiresAffiliationNumber ? (
            <div className="space-y-2">
              <Label htmlFor="signup-affiliation" className="text-gray-700 font-medium">
                Número de afiliado
              </Label>
              <Input
                id="signup-affiliation"
                autoComplete="off"
                autoCapitalize="characters"
                value={data.affiliationNumber}
                aria-invalid={Boolean(errors.affiliationNumber)}
                onChange={(event) =>
                  onChange({ affiliationNumber: event.target.value })
                }
                className="h-12 text-base border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary"
              />
              <p className="text-sm text-gray-500">
                Está en tu credencial. Solo números, letras, guiones o barras.
              </p>
              <FieldError message={errors.affiliationNumber} />
            </div>
          ) : (
            <p className="text-sm text-gray-500" data-testid="signup-particular-note">
              Como particular no hace falta número de afiliado.
            </p>
          )}
        </div>
      )}
    </StepFrame>
  );
}
