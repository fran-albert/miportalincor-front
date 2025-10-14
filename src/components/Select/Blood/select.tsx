import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";

interface BloodSelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name?: Path<T>;
  defaultValue?: string;
  disabled?: boolean;
}

export const BloodSelect = <T extends FieldValues = FieldValues>({
  control,
  name = "bloodType" as Path<T>,
  defaultValue,
  disabled,
}: BloodSelectProps<T>) => {
  const bloodTypes = [
    { id: "A", name: "A" },
    { id: "B", name: "B" },
    { id: "O", name: "O" },
  ];

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={(defaultValue || "") as PathValue<T, Path<T>>}
      render={({ field }) => (
        <div>
          <Select
            value={field.value}
            disabled={disabled}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione el tipo de sangre..." />
            </SelectTrigger>
            <SelectContent>
              {bloodTypes.map((type) => (
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
