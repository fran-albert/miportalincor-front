import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCity } from "@/hooks/City/useCity";
import { City } from "@/types/City/City";
import { State } from "@/types/State/State";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";

interface CitySelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name?: Path<T>;
  idState: number;
  currentState?: State; // The currently selected state to include in the city object
  defaultValue?: City;
  onCityChange?: (value: City) => void;
  disabled?: boolean;
}

// Helper to extract ID from either a City object or string
const getCityId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as City).id);
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "";
};

export const CitySelect = <T extends FieldValues = FieldValues>({
  control,
  name = "city" as Path<T>,
  idState,
  currentState,
  defaultValue,
  onCityChange,
  disabled,
}: CitySelectProps<T>) => {
  const { cities } = useCity({ idState });

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={(defaultValue ?? undefined) as PathValue<T, Path<T>>}
      render={({ field }) => {
        // Get the ID for the Select component (works with both object and string values)
        const selectValue = getCityId(field.value);

        const handleValueChange = (cityId: string) => {
          const selectedCity = cities.find((c) => String(c.id) === cityId);
          if (selectedCity) {
            // Get the base state from currentState or selectedCity
            const baseState = currentState || selectedCity.state || { id: idState, name: "" };

            // Ensure state has country (default to Argentina)
            const stateWithCountry = {
              ...baseState,
              country: baseState.country || { id: 1, name: "Argentina" },
            };

            // Build the full City object with nested State (including country)
            const cityWithState: City = {
              id: selectedCity.id,
              name: selectedCity.name,
              state: stateWithCountry,
            };

            // Store the full City object in the form
            field.onChange(cityWithState as PathValue<T, Path<T>>);

            // If callback exists, execute it with the full object
            if (onCityChange) {
              onCityChange(cityWithState);
            }
          }
        };

        return (
          <div>
            <Select
              value={selectValue}
              onValueChange={handleValueChange}
              disabled={disabled || !idState || cities.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione la localidad..." />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={String(city.id)} value={String(city.id)}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }}
    />
  );
};
