import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnit } from "@/hooks/Units/useUnit";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";


interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  defaultValue?: { id: number; name: string; shortName: string } | null;
  disabled?: boolean;
}

export const UnitSelect = <T extends FieldValues = FieldValues>({ control, defaultValue, disabled }: Props<T>) => {
  const { units } = useUnit({});

  return (
    <Controller
      name={"unit" as Path<T>}
      control={control}
      defaultValue={(defaultValue || null) as PathValue<T, Path<T>>}
      render={({ field }) => (
        <Select
          value={field.value?.id?.toString() || ""}
          disabled={disabled}
          onValueChange={(value) => {
            const selectedUnit = units.find(
              (unit) => unit.id.toString() === value
            );
            field.onChange(selectedUnit || null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione la unidad..." />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id.toString()}>
                {unit.name} ({unit.shortName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
};
