import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";

interface GenderSelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name?: Path<T>;
  defaultValue?: string;
  disabled?: boolean;
}
export const GenderSelect = <T extends FieldValues = FieldValues>({
  control,
  name = "gender" as Path<T>,
  defaultValue,
  disabled,
}: GenderSelectProps<T>) => {
  const genderTypes = [
    { id: "Masculino", name: "Masculino" },
    { id: "Femenino", name: "Femenino" },
  ];

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: "Este campo es obligatorio" }}
      defaultValue={(defaultValue || "") as PathValue<T, Path<T>>}
      render={({ field }) => (
        <div>
          <Select
            value={field.value}
            onValueChange={(value) => field.onChange(value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione el género.." />
            </SelectTrigger>
            <SelectContent>
              {genderTypes.map((type) => (
                <SelectItem key={type.id} value={type.name}>
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
