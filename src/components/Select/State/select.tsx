import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useState } from "@/hooks/State/useState";
import { State } from "@/types/State/State";

interface StateSelectProps {
  control: any;
  defaultValue?: State;
  onStateChange?: (value: State) => void;
  disabled?: boolean;
}

export const StateSelect = ({
  control,
  defaultValue,
  disabled,
  onStateChange,
}: StateSelectProps) => {
  const { states } = useState();
  const handleValueChange = (selectedId: string) => {
    const selectedState = states.find(
      (state) => String(state.id) === selectedId
    );
    if (onStateChange && selectedState) {
      onStateChange(selectedState);
    }
  };

  return (
    <Controller
      name="state"
      control={control}
      rules={{ required: "Este campo es obligatorio" }}
      defaultValue={defaultValue ? defaultValue.id.toString() : ""}
      render={({ field }) => (
        <div>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              handleValueChange(value);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione la provincia..." />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
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
