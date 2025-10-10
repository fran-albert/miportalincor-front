import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";

interface RHFactorSelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  defaultValue?: string;
  disabled?: boolean;
}
export const RHFactorSelect = <T extends FieldValues = FieldValues>({
  control,
  disabled,
  defaultValue,
}: RHFactorSelectProps<T>) => {
  const rhTypes = [
    { id: "Positivo", name: "Positivo" },
    { id: "Negativo", name: "Negativo" },
  ];

  return (
    <Controller
      name={"rhFactor" as Path<T>}
      control={control}
      defaultValue={(defaultValue || "") as PathValue<T, Path<T>>}
      // rules={{ required: "Este campo es obligatorio" }}
      render={({ field }) => (
        <div>
          <Select
            value={field.value}
            onValueChange={(value) => field.onChange(value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione el factor RH.." />
            </SelectTrigger>
            <SelectContent>
              {rhTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
};
