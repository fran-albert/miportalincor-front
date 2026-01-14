import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";
import { useState } from "@/hooks/State/useState";
import { State } from "@/types/State/State";

interface StateSelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: Path<T>;
  defaultValue?: State;
  onStateChange?: (value: State) => void;
  disabled?: boolean;
}

// Helper to extract ID from either a State object or string
const getStateId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "object" && value !== null && "id" in value) {
    return String((value as State).id);
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return "";
};

export const StateSelect = <T extends FieldValues = FieldValues>({
  control,
  name,
  defaultValue,
  disabled,
  onStateChange,
}: StateSelectProps<T>) => {
  const { states } = useState();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={(defaultValue ?? undefined) as PathValue<T, Path<T>>}
      render={({ field }) => {
        // Get the ID for the Select component (works with both object and string values)
        const selectValue = getStateId(field.value);

        const handleValueChange = (selectedId: string) => {
          const selectedState = states?.find(
            (state) => String(state.id) === selectedId
          );
          if (selectedState) {
            // Ensure state has country (default to Argentina)
            const stateWithCountry = {
              ...selectedState,
              country: selectedState.country || { id: 1, name: "Argentina" },
            };

            // Store the full State object in the form
            field.onChange(stateWithCountry as PathValue<T, Path<T>>);
            // If callback exists, execute it with the full object
            if (onStateChange) {
              onStateChange(stateWithCountry);
            }
          }
        };

        return (
          <div>
            <Select
              value={selectValue}
              onValueChange={handleValueChange}
              disabled={disabled || !states?.length}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione la provincia..." />
              </SelectTrigger>
              <SelectContent>
                {states?.map((state) => (
                  <SelectItem key={String(state.id)} value={String(state.id)}>
                    {state.name}
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
