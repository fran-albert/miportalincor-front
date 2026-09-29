import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { City } from "@/types/City/City";
import { State } from "@/types/State/State";
import { FieldError, StepFrame } from "../StepFrame";
import { SearchableList } from "../SearchableList";
import { addressSchema, fieldErrors } from "../signup.schemas";
import { SignupFormData, StepProps } from "../types";
import { withoutErrorsFor } from "../signup.utils";

const inputClass =
  "h-12 text-base border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary";

interface StepAddressProps extends StepProps {
  states: State[];
  cities: City[];
  isLoadingCities: boolean;
}

export function StepAddress({
  data,
  onChange,
  onBack,
  onNext,
  nextLabel,
  states,
  cities,
  isLoadingCities,
}: StepAddressProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const change = (patch: Partial<SignupFormData>) => {
    onChange(patch);
    setErrors((current) => withoutErrorsFor(current, Object.keys(patch)));
  };

  const handleNext = () => {
    const result = addressSchema.safeParse({
      stateId: data.stateId,
      cityId: data.cityId,
      street: data.street,
      number: data.number,
      description: data.description,
    });
    setErrors(fieldErrors(result));
    if (result.success) onNext();
  };

  return (
    <StepFrame
      step={4}
      title="Tu dirección"
      description="Donde vivís hoy."
      onBack={onBack}
      onNext={handleNext}
      nextLabel={nextLabel}
    >
      <div className="space-y-2">
        <Label htmlFor="signup-state" className="text-gray-700 font-medium">
          Provincia
        </Label>
        <Select
          value={data.stateId ? String(data.stateId) : ""}
          onValueChange={(value) => {
            const state = states.find((s) => String(s.id) === value);
            change({
              stateId: state ? state.id : null,
              stateName: state?.name ?? "",
              cityId: null,
              cityName: "",
            });
          }}
        >
          <SelectTrigger
            id="signup-state"
            className="h-12 text-base border-gray-300"
            aria-invalid={Boolean(errors.stateId)}
          >
            <SelectValue placeholder="Elegí tu provincia" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.id} value={String(state.id)}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.stateId} />
      </div>

      {data.stateId !== null && (
        <div className="space-y-2">
          <Label htmlFor="signup-city-search" className="text-gray-700 font-medium">
            Ciudad
          </Label>
          {data.cityId !== null ? (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
              data-testid="signup-city-selected"
            >
              <div className="flex items-center gap-3 min-w-0">
                <MapPin className="h-5 w-5 shrink-0 text-greenPrimary" />
                <span className="font-medium text-gray-900 truncate">
                  {data.cityName}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-greenPrimary hover:text-teal-700 shrink-0"
                onClick={() => change({ cityId: null, cityName: "" })}
              >
                Cambiar
              </Button>
            </div>
          ) : (
            <SearchableList
              inputId="signup-city-search"
              testId="signup-city-list"
              placeholder="Buscá tu ciudad"
              emptyText="No encontramos esa ciudad en la provincia elegida."
              isLoading={isLoadingCities}
              invalid={Boolean(errors.cityId)}
              options={cities.map((c) => ({ id: c.id, label: c.name }))}
              onSelect={(option) =>
                change({ cityId: option.id, cityName: option.label })
              }
            />
          )}
          <FieldError message={errors.cityId} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="signup-street" className="text-gray-700 font-medium">
            Calle
          </Label>
          <Input
            id="signup-street"
            autoComplete="address-line1"
            value={data.street}
            aria-invalid={Boolean(errors.street)}
            onChange={(event) => change({ street: event.target.value })}
            className={inputClass}
          />
          <FieldError message={errors.street} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-number" className="text-gray-700 font-medium">
            Número
          </Label>
          <Input
            id="signup-number"
            inputMode="numeric"
            value={data.number}
            aria-invalid={Boolean(errors.number)}
            onChange={(event) => change({ number: event.target.value })}
            className={inputClass}
          />
          <FieldError message={errors.number} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-description" className="text-gray-700 font-medium">
          Piso / Depto <span className="font-normal text-gray-500">(opcional)</span>
        </Label>
        <Input
          id="signup-description"
          autoComplete="address-line2"
          placeholder="Ej: 2° B"
          value={data.description}
          onChange={(event) => change({ description: event.target.value })}
          className={inputClass}
        />
      </div>
    </StepFrame>
  );
}
