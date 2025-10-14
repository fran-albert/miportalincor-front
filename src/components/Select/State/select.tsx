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
      render={({ field }) => {
        // Ensure we always use a string value for the Select component
        const selectValue = field.value && field.value !== "" ? String(field.value) : "";

        console.log('StateSelect render - field.value:', field.value, 'selectValue:', selectValue);

        return (
          <div>
            <Select
              value={selectValue}
              onValueChange={(value) => {
                console.log('StateSelect onChange - new value:', value);
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
        );
      }}
    />
  );
};
