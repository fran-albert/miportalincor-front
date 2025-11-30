import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanies } from "@/hooks/Company/useCompanies";
import { Company } from "@/types/Company/Company";
import { Controller, Control, FieldValues, Path, PathValue } from "react-hook-form";

interface CompanySelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name?: Path<T>;
  defaultValue?: Company | null;
  disabled?: boolean;
}

export const CompanySelect = <T extends FieldValues = FieldValues>({
  control,
  name = "idCompany" as Path<T>,
  defaultValue,
  disabled,
}: CompanySelectProps<T>) => {
  const { companies } = useCompanies({ auth: true, fetch: true });

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={(defaultValue || null) as PathValue<T, Path<T>>}
      render={({ field }) => (
        <Select
          value={field.value?.toString() || ""}
          disabled={disabled}
          onValueChange={(value) => field.onChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione la empresa..." />
          </SelectTrigger>
          <SelectContent>
            {companies.map((unit) => (
              <SelectItem key={unit.id} value={unit.id.toString()}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
};
