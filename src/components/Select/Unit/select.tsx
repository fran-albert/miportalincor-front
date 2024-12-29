import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { useUnit } from "@/hooks/Units/useUnit";
  import { Controller } from "react-hook-form";
  
  interface Props {
    control: any;
    defaultValue?: { id: number; name: string; shortName: string } | null;
    disabled?: boolean;
  }
  
  export const UnitSelect = ({ control, defaultValue, disabled }: Props) => {
    const { units } = useUnit({});
  
    return (
      <Controller
        name="unit"
        control={control}
        defaultValue={defaultValue || null}
        render={({ field }) => (
          <Select
            value={field.value?.id?.toString() || ""}
            disabled={disabled}
            onValueChange={(value) => {
              const selectedUnit = units.find((unit) => unit.id.toString() === value);
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
  