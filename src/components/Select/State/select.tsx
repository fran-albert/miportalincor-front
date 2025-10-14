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

export const StateSelect = <T extends FieldValues = FieldValues>({
  control,
  name,
  defaultValue,
  disabled,
  onStateChange,
}: StateSelectProps<T>) => {
  const { states } = useState();

  const handleValueChange = (selectedId: string) => {
    const selectedState = states?.find(
      (state) => String(state.id) === selectedId
    );
    if (onStateChange && selectedState) {
      onStateChange(selectedState);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={(defaultValue?.id ? String(defaultValue.id) : "") as PathValue<T, Path<T>>}
      render={({ field }) => (
        <div>
          <Select
            value={
              field.value || (defaultValue?.id ? String(defaultValue.id) : "")
            } // Asegura que tenga un valor inicial
            onValueChange={(value) => {
              field.onChange(value);
              handleValueChange(value);
            }}
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
      )}
    />
  );
};
