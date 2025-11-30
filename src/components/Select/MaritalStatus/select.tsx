import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";

interface MaritalStatusSelectProps<T extends FieldValues = FieldValues> {
  defaultValue?: string;
  control: Control<T>;
  disabled?: boolean;
}
export const MaritalStatusSelect = <T extends FieldValues = FieldValues>({
  control,
  disabled,
  defaultValue,
}: MaritalStatusSelectProps<T>) => {
  const maritalStatus = [
    { id: "Soltero", name: "Soltero" },
    { id: "Casado", name: "Casado" },
    { id: "Divorciado", name: "Divorciado" },
  ];

  return (
    <Controller
      name={"maritalStatus" as Path<T>}
      defaultValue={(defaultValue || "") as PathValue<T, Path<T>>}
      control={control}
      // rules={{ required: "Este campo es obligatorio" }}
      render={({ field }) => (
        <div>
          <Select
            value={field.value}
            onValueChange={(value) => field.onChange(value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione el estado civil.." />
            </SelectTrigger>
            <SelectContent>
              {maritalStatus.map((type) => (
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
